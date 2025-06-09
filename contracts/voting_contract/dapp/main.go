package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	wasmbridge "github.com/rubixchain/rubix-wasm/go-wasm-bridge"
)

// Vote matches Rust struct
type Vote struct {
	VoterID string `json:"voter_id"`
	Color   string `json:"color"`
}

type VotesInput struct {
	Votes []Vote `json:"votes"`
}

type ContractResponse struct {
	Msg string `json:"msg"`
}

var wasmModule *wasmbridge.WasmModule

func main() {
	// Initialize WASM module once
	wasmFile := "/Users/arnab/TRIE-internal/contracts/voting_contract/artifacts/voting_contract.wasm"
	hostFnRegistry := wasmbridge.NewHostFunctionRegistry()

	var err error
	wasmModule, err = wasmbridge.NewWasmModule(wasmFile, hostFnRegistry)
	if err != nil {
		panic(fmt.Errorf("Failed to initialize WASM module: %v", err))
	}

	r := gin.Default()
	r.POST("/api/voting-contract", votingHandler)
	fmt.Println("Server running at http://localhost:8080/")
	r.Run(":8080")
}

func votingHandler(c *gin.Context) {
	var input VotesInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON input"})
		return
	}

	// Reset previous votes
	fmt.Println("Calling: reset_votes")
	resetMsg, err := callWasmFunc("reset_votes", "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	fmt.Println("reset_votes response:", resetMsg)

	// Cast votes
	for _, vote := range input.Votes {
		voteJson, _ := json.Marshal(vote)
		fmt.Printf("Calling: cast_vote with input: %s\n", string(voteJson))
		castResp, err := callWasmFunc("cast_vote", string(voteJson))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		fmt.Println("cast_vote response:", castResp)
	}

	// Tally
	fmt.Println("Calling: tally_votes")
	tallyMsg, err := callWasmFunc("tally_votes", "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	fmt.Println("tally_votes response:", tallyMsg)

	// Winner
	fmt.Println("Calling: get_winner")
	winnerMsg, err := callWasmFunc("get_winner", "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	fmt.Println("get_winner response:", winnerMsg)

	// Final output
	c.JSON(http.StatusOK, gin.H{
		"tally":  tallyMsg,
		"winner": winnerMsg,
	})
}

// callWasmFunc formats the input correctly and calls the WASM contract function
func callWasmFunc(funcName string, input string) (string, error) {
	payload := map[string]string{
		funcName: input,
	}
	jsonReq, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("failed to marshal input for %s: %v", funcName, err)
	}

	fmt.Printf("Calling WASM function: %s with payload: %s\n", funcName, string(jsonReq))
	output, err := wasmModule.CallFunction(string(jsonReq))
	if err != nil {
		return "", fmt.Errorf("failed to call %s: %v", funcName, err)
	}

	var resp ContractResponse
	if err := json.Unmarshal([]byte(output), &resp); err != nil {
		return "", fmt.Errorf("invalid response from %s: %v", funcName, err)
	}

	return resp.Msg, nil
}

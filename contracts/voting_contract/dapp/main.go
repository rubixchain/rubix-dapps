package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"path"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	wasmbridge "github.com/rubixchain/rubix-wasm/go-wasm-bridge"
)

var (
	voteStore = make(map[string]string) // map[voter_id]color
	storeLock = sync.Mutex{}
)

func main() {
	_ = godotenv.Load()
	r := gin.Default()
	r.POST("/api/voting-contract", handleVotingContract)
	r.Run(":8080")
}

func wrapError(f func(code int, obj any), msg string) {
	fmt.Println("ERROR:", msg)
	f(http.StatusBadRequest, gin.H{"status": "error", "message": msg})
}

func wrapSuccess(f func(code int, obj any), msg string) {
	fmt.Println("SUCCESS:", msg)
	f(http.StatusOK, gin.H{"status": "success", "message": msg})
}

func handleVotingContract(c *gin.Context) {
	nodeAddress := os.Getenv("RUBIX_NODE_ADDRESS")
	contractPath := os.Getenv("VOTING_CONTRACT_PATH")

	var contractInput struct {
		Method  string                 `json:"method"`
		Payload map[string]interface{} `json:"payload"`
	}
	if err := c.ShouldBindJSON(&contractInput); err != nil {
		wrapError(c.JSON, "Invalid request body")
		return
	}

	method := contractInput.Method
	payload := contractInput.Payload

	switch method {
	case "cast_and_tally":
		voterID, ok1 := payload["voter_id"].(string)
		color, ok2 := payload["color"].(string)
		if !ok1 || !ok2 {
			wrapError(c.JSON, "Missing or invalid voter_id or color")
			return
		}

		storeLock.Lock()
		voteStore[voterID] = color
		tally := make(map[string]int)
		for _, c := range voteStore {
			tally[c]++
		}

		// Determine winner
		winner := ""
		maxVotes := -1
		for color, count := range tally {
			if count > maxVotes {
				maxVotes = count
				winner = color
			}
		}
		storeLock.Unlock()

		result := fmt.Sprintf("Vote recorded. Tally: %v. Current winner: %s", tally, winner)
		wrapSuccess(c.JSON, result)
		return

	default:
		// Default fallback to wasm contract execution
		hostFnRegistry := wasmbridge.NewHostFunctionRegistry()
		wasmModule, err := wasmbridge.NewWasmModule(contractPath, hostFnRegistry, wasmbridge.WithRubixNodeAddress(nodeAddress))
		if err != nil {
			wrapError(c.JSON, fmt.Sprintf("failed to load wasm module: %v", err))
			return
		}

		input := map[string]interface{}{method: payload}
		inputBytes, _ := json.Marshal(input)
		result, err := wasmModule.CallFunction(string(inputBytes))
		if err != nil {
			wrapError(c.JSON, fmt.Sprintf("failed to call contract function: %v", err))
			return
		}

		msg, errMsg := extractContractOutput(result)
		if errMsg != "" {
			wrapError(c.JSON, fmt.Sprintf("contract execution failed: %v", errMsg))
			return
		}
		wrapSuccess(c.JSON, msg)
	}
}

func extractContractOutput(result string) (string, string) {
	var out struct {
		Msg string `json:"msg"`
	}
	if err := json.Unmarshal([]byte(result), &out); err == nil && out.Msg != "" {
		return out.Msg, ""
	}
	return "", result
}

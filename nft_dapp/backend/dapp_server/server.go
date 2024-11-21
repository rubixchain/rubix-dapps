package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	wasmbridge "github.com/rubixchain/rubix-wasm/go-wasm-bridge"
)

// Handler function for /api/run-dapp
func runDAppHandler(c *gin.Context) {

	var req ContractInputRequest

	err := json.NewDecoder(c.Request.Body).Decode(&req)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		fmt.Printf("Error reading response body: %s\n", err)
		return
	}
	config := GetConfig()
	smartContractHash := req.SmartContractHash
	smartContractTokenData := GetSmartContractData(smartContractHash, config.NodeAddress)
	fmt.Println("Smart Contract Token Data :", string(smartContractTokenData))

	var dataReply SmartContractDataReply

	if err := json.Unmarshal(smartContractTokenData, &dataReply); err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Println("Data reply in runDappHandler", dataReply)
	smartContractData := dataReply.SCTDataReply
	var relevantData string
	for _, reply := range smartContractData {
		fmt.Println("SmartContractData:", reply.SmartContractData)
		relevantData = reply.SmartContractData
	}
	var inputMap map[string]interface{}
	err1 := json.Unmarshal([]byte(relevantData), &inputMap)
	if err1 != nil {
		return
	}
	if len(inputMap) != 1 {
		return
	}

	var funcName string
	var inputStruct interface{}
	for key, value := range inputMap {
		funcName = key
		inputStruct = value
	}
	fmt.Println("The function name extracted =", funcName)
	fmt.Println("The inputStruct Value :", inputStruct)
	var requestId string
	switch funcName {
	case "mint_sample_nft":
		requestId = smartContractHash + "mint"
	case "transfer_sample_nft":
		requestId = smartContractHash + "-transfer"
	default:
		requestId = ""
	}
	checkResult, err := checkStringInRequests(requestId)
	if err != nil {
		fmt.Println("Error checking result:", err)
	}
	if !checkResult {
		err = insertRequest(requestId, 0)
		if err != nil {
			fmt.Println("Error inserting request:", err)
		}
	}

	hostFnRegistry := wasmbridge.NewHostFunctionRegistry()

	// Initialize the WASM module
	wasmModule, err := wasmbridge.NewWasmModule(
		config.NftContractPath,
		hostFnRegistry,
		wasmbridge.WithRubixNodeAddress(config.NodeAddress),
		wasmbridge.WithQuorumType(2),
	)
	if err != nil {
		log.Fatalf("Failed to initialize WASM module: %v", err)
	}

	executionResult, err := executeAndGetContractResult(wasmModule, relevantData)
	if err != nil {
		log.Fatalf("Failed to execute contract: %v", err)
	}
	fmt.Println("The result returned is :", executionResult)
	// Business logic for "run-dapp" operation
	// Example: simulate running a DApp
	var response BasicResponse

	// Convert JSON string to struct
	err = json.Unmarshal([]byte(executionResult), &response)
	if err != nil {
		log.Fatalf("Error parsing JSON: %v", err)
	}
	if response.Status {
		updateRequestStatus(requestId, 1)
	} else {
		updateRequestStatus(requestId, 2)
	}
	resultFinal := gin.H{
		"message": "DApp executed successfully",
		"data":    response,
	}

	// Return a response
	c.JSON(http.StatusOK, resultFinal)
}

// Handler function for /request-status
func getRequestStatusHandler(c *gin.Context) {
	reqId := c.Query("req_id")
	// Open a SQLite database connection
	db, err := sql.Open("sqlite3", "./requests.db")
	if err != nil {
		log.Fatalf("Failed to open the database: %v", err)
	}
	defer db.Close()
	var status int

	// Prepare the SQL query
	query := `SELECT status FROM requests WHERE request_id = ?`

	// Execute the query
	err = db.QueryRow(query, reqId).Scan(&status)
	if err != nil {
		if err == sql.ErrNoRows {
			// No rows found
			fmt.Printf("no record found with request_id: %s", reqId)
		}
		fmt.Printf("Query Failed")
	}

	// Return the status
	resultFinal := gin.H{
		"message": "Request Status: " + strconv.Itoa(status),
		"status":  status,
	}

	// Return a response
	c.JSON(http.StatusOK, resultFinal)

}

func bootupServer() {
	// Initialize a Gin router
	router := gin.Default()

	// Define endpoints
	router.POST("/api/run-dapp", runDAppHandler)
	router.GET("/request-status", getRequestStatusHandler)

	// Start the server on port 8080
	router.Run(":8080")
}

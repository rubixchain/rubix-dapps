package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
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
	fmt.Println("Received Smart Contract hash: ", req.SmartContractHash)

	smartContractTokenData := GetSmartContractData(smartContractHash, config.NodeAddress)
	if smartContractTokenData == nil {
		fmt.Println("Unable to fetch latest smart contract data")
		return
	}

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
		requestId = smartContractHash + "-mint"
	case "transfer_sample_nft":
		requestId = smartContractHash + "-transfer"
	default:
		fmt.Println("This function name is not allowed")
		return
	}
	checkResult, err := checkStringInRequests(requestId)
	if err != nil {
		fmt.Println("Error checking result:", err)
		return
	}
	if !checkResult {
		err = insertRequest(requestId, Pending) //Add constants for the status
		if err != nil {
			fmt.Println("Error inserting request:", err)
			return
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
		return
	}

	executionResult, err := executeAndGetContractResult(wasmModule, relevantData)
	if err != nil {
		log.Fatalf("Failed to execute contract: %v", err)
		return
	}
	fmt.Println("The result returned is :", executionResult)
	var response BasicResponse

	// Convert JSON string to struct
	if executionResult == "success" {
		response = BasicResponse{Status: true, Message: "NFT Transferred Succesfully"}
	} else {
		err = json.Unmarshal([]byte(executionResult), &response)
		if err != nil {
			log.Fatalf("Error parsing JSON: %v", err)
			return
		}
	}

	if response.Status {
		err = updateRequestStatus(requestId, Success)
		if err != nil {
			fmt.Println("Error updating request status:", err)
			return
		} //handle error here
	} else {
		err = updateRequestStatus(requestId, Failed)
		if err != nil {
			fmt.Println("Error updating request status:", err)
			return
		}
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
		return
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
			return
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
	config := GetConfig()

	log.SetFlags(log.LstdFlags)

	// Configure CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
	}))

	// Define endpoints
	router.POST(config.DappServerApi, runDAppHandler)
	router.GET("/request-status", getRequestStatusHandler)

	// Start the server on port 8080
	router.Run(":8080")
}

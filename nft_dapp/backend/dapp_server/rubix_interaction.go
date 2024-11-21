package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	wasmbridge "github.com/rubixchain/rubix-wasm/go-wasm-bridge"
)

func GetSmartContractData(token string, address string) []byte {
	data := map[string]interface{}{
		"token":  token,
		"latest": true,
	}
	bodyJSON, err := json.Marshal(data)
	if err != nil {
		fmt.Println("Error marshaling JSON:", err)
	}
	url := address + "/api/get-smart-contract-token-chain-data"
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(bodyJSON))
	if err != nil {
		fmt.Println("Error creating HTTP request:", err)
	}
	req.Header.Set("Content-Type", "application/json; charset=UTF-8")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error sending HTTP request:", err)
	}
	fmt.Println("Response Status:", resp.Status)
	data2, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Error reading response body: %s\n", err)
	}
	// Process the data as needed
	fmt.Println("Response Body in get smart contract data :", string(data2))

	return data2

}

func executeAndGetContractResult(wasmModule *wasmbridge.WasmModule, contractInput string) (string, error) {
	// Call the function
	contractResult, err := wasmModule.CallFunction(contractInput)
	if err != nil {
		return "", fmt.Errorf("function call failed: %v", err)
	}

	return contractResult, nil
}

package main

import (
	"encoding/json"
	"log"
	"os"
)

func GetConfig() Config {
	// Open the JSON file
	file, err := os.Open("../../app.node.json")
	if err != nil {
		log.Fatalf("Failed to open file: %v", err)
	}
	defer file.Close()

	// Decode the JSON file into the Config struct
	var config Config
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&config); err != nil {
		log.Fatalf("Failed to decode JSON: %v", err)
	}

	return config
}

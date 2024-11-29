package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

func initDB() {
	// Open a SQLite database connection
	db, err := sql.Open("sqlite3", "./requests.db")
	if err != nil {
		log.Fatalf("Failed to open the database: %v", err)
	}
	defer db.Close()

	// Create the requests table
	createTableQuery := `
	CREATE TABLE IF NOT EXISTS requests (
		request_id TEXT PRIMARY KEY,
		status INTEGER
	);`
	_, err = db.Exec(createTableQuery)
	if err != nil {
		log.Fatalf("Failed to create table: %v", err)
	}

	fmt.Println("Table 'requests' created successfully!")
}

// insertRequest inserts a new request into the database
func insertRequest(requestID string, status int) error {
	db, err := sql.Open("sqlite3", "./requests.db")
	if err != nil {
		log.Fatalf("Failed to open the database: %v", err)
	}
	defer db.Close()
	insertQuery := `INSERT INTO requests (request_id, status) VALUES (?, ?);`
	_, err1 := db.Exec(insertQuery, requestID, status)
	if err1 != nil {
		return fmt.Errorf("failed to insert record: %w", err)
	}
	fmt.Printf("Inserted request_id: %s with status: %d\n", requestID, status)
	return nil
}

// updateRequestStatus updates the status of an existing request in the database
func updateRequestStatus(requestID string, newStatus int) error {
	db, err := sql.Open("sqlite3", "./requests.db")
	if err != nil {
		log.Fatalf("Failed to open the database: %v", err)
	}
	defer db.Close()
	updateQuery := `UPDATE requests SET status = ? WHERE request_id = ?;`
	_, err1 := db.Exec(updateQuery, newStatus, requestID)
	if err1 != nil {
		return fmt.Errorf("failed to update record: %w", err)
	}
	fmt.Printf("Updated request_id: %s to new status: %d\n", requestID, newStatus)
	return nil
}

func checkStringInRequests(searchString string) (bool, error) {
	db, err := sql.Open("sqlite3", "./requests.db")
	if err != nil {
		log.Fatalf("Failed to open the database: %v", err)
	}
	defer db.Close()
	query := `SELECT COUNT(1) FROM requests WHERE request_id = ?;`

	var count int
	err = db.QueryRow(query, searchString).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("failed to execute query: %w", err)
	}

	return count > 0, nil
}

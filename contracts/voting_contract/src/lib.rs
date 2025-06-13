/* use rubixwasm_std::contract_fn;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Debug)]
pub struct ContractResponse {
    pub msg: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ContractError {
    pub msg: String,
}

impl ContractError {
    pub fn new(msg: &str) -> Self {
        ContractError {
            msg: msg.to_string(),
        }
    }
}

const ALLOWED_COLORS: [&str; 3] = ["Red", "Green", "Blue"];

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Vote {
    pub voter_id: String,
    pub color: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CastVote {
    pub voter_id: String,
    pub color: String,
}

// Use an Option<Vec<Vote>> with lazy initialization for safety
static mut VOTES: Option<Vec<Vote>> = None;

fn get_votes() -> &'static mut Vec<Vote> {
    unsafe {
        if VOTES.is_none() {
            VOTES = Some(Vec::new());
        }
        VOTES.as_mut().unwrap()
    }
}

#[contract_fn]
pub fn cast_vote(cast_vote: CastVote) -> Result<String, ContractError> {
    let input_vote = cast_vote.color;
    let input_voter_id = cast_vote.voter_id;

    if !ALLOWED_COLORS.contains(&input_vote.as_str()) {
        return Err(ContractError::new(&format!("Invalid colour '{}'", &input_vote.as_str())));
    }

    let votes = get_votes();
    votes.push(Vote {
        voter_id: input_voter_id.clone(),
        color: input_vote.clone(),
    });

    let response = ContractResponse {
        msg: "Vote cast successfully".to_string(),
    };
    serde_json::to_string(&response)
        .map_err(|e| ContractError::new(&format!("Serialization error: {}", e)))
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TallyVotes {}

#[contract_fn]
pub fn tally_votes(_: TallyVotes) -> Result<String, ContractError> {
    let mut counts = HashMap::new();
    let votes = get_votes();
    for vote in votes.iter() {
        *counts.entry(vote.color.clone()).or_insert(0) += 1;
    }

    let msg = format!("Vote tally: {:?}", counts);
    let response = ContractResponse { msg };
    serde_json::to_string(&response)
        .map_err(|e| ContractError::new(&format!("Serialization error: {}", e)))
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GetWinner {}

#[contract_fn]
pub fn get_winner(_: GetWinner) -> Result<String, ContractError> {
    let mut counts = HashMap::new();
    let votes = get_votes();
    if votes.is_empty() {
        return Err(ContractError::new("No votes cast"));
    }
    for vote in votes.iter() {
        *counts.entry(vote.color.clone()).or_insert(0) += 1;
    }

    let winner = counts
        .iter()
        .max_by_key(|entry| entry.1)
        .map(|(color, _)| color.clone())
        .unwrap();

    let response = ContractResponse {
        msg: format!("Winner is {}", winner),
    };
    serde_json::to_string(&response)
        .map_err(|e| ContractError::new(&format!("Serialization error: {}", e)))
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ResetVotes {}

#[contract_fn]
pub fn reset_votes(_: ResetVotes) -> Result<String, ContractError> {
    let votes = get_votes();
    votes.clear();

    let response = ContractResponse {
        msg: "Votes have been reset".to_string(),
    };
    serde_json::to_string(&response)
        .map_err(|e| ContractError::new(&format!("Serialization error: {}", e)))
}
*/

/* 
use rubixwasm_std::contract_fn;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Debug)]
pub struct ContractResponse {
    pub msg: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ContractError {
    pub msg: String,
}

impl ContractError {
    pub fn new(msg: &str) -> Self {
        ContractError {
            msg: msg.to_string(),
        }
    }
}

const ALLOWED_COLORS: [&str; 3] = ["Red", "Green", "Blue"];

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Vote {
    pub voter_id: String,
    pub color: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CastVote {
    pub voter_id: String,
    pub color: String,
}

static mut VOTES: Option<Vec<Vote>> = None;

fn get_votes() -> &'static mut Vec<Vote> {
    unsafe {
        if VOTES.is_none() {
            VOTES = Some(Vec::new());
        }
        VOTES.as_mut().unwrap()
    }
}

#[contract_fn]
pub fn cast_vote(cast_vote: CastVote) -> Result<String, ContractError> {
    let input_vote = cast_vote.color;
    let input_voter_id = cast_vote.voter_id;

    if !ALLOWED_COLORS.contains(&input_vote.as_str()) {
        return Err(ContractError::new(&format!("Invalid colour '{}'", &input_vote.as_str())));
    }

    let votes = get_votes();
    votes.push(Vote {
        voter_id: input_voter_id.clone(),
        color: input_vote.clone(),
    });

    let response = ContractResponse {
        msg: "Vote cast successfully".to_string(),
    };

    serde_json::to_string(&response)
        .map_err(|e| ContractError::new(&format!("Serialization error: {}", e)))
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RegisterVote {
    pub voter_id: String,
    pub color: String,
}

#[contract_fn]
pub fn register_vote(_: RegisterVote) -> Result<String, ContractError> {
    let response = ContractResponse {
        msg: "Vote registered (noop)".to_string(),
    };
    serde_json::to_string(&response)
        .map_err(|e| ContractError::new(&format!("Serialization error: {}", e)))
}

#[derive(Serialize, Deserialize, Debug)]
pub struct TallyVotes {}

#[contract_fn]
pub fn tally_votes(_: TallyVotes) -> Result<String, ContractError> {
    let mut counts = HashMap::new();
    let votes = get_votes();
    for vote in votes.iter() {
        *counts.entry(vote.color.clone()).or_insert(0) += 1;
    }

    let msg = format!("Vote tally: {:?}", counts);
    let response = ContractResponse { msg };
    serde_json::to_string(&response)
        .map_err(|e| ContractError::new(&format!("Serialization error: {}", e)))
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GetWinner {}

#[contract_fn]
pub fn get_winner(_: GetWinner) -> Result<String, ContractError> {
    let mut counts = HashMap::new();
    let votes = get_votes();
    if votes.is_empty() {
        return Err(ContractError::new("No votes cast"));
    }
    for vote in votes.iter() {
        *counts.entry(vote.color.clone()).or_insert(0) += 1;
    }

    let winner = counts
        .iter()
        .max_by_key(|entry| entry.1)
        .map(|(color, _)| color.clone())
        .unwrap();

    let response = ContractResponse {
        msg: format!("Winner is {}", winner),
    };
    serde_json::to_string(&response)
        .map_err(|e| ContractError::new(&format!("Serialization error: {}", e)))
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ResetVotes {}

#[contract_fn]
pub fn reset_votes(_: ResetVotes) -> Result<String, ContractError> {
    let votes = get_votes();
    votes.clear();

    let response = ContractResponse {
        msg: "Votes have been reset".to_string(),
    };
    serde_json::to_string(&response)
        .map_err(|e| ContractError::new(&format!("Serialization error: {}", e)))
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GetAllVotes {}

#[contract_fn]
pub fn get_all_votes(_: GetAllVotes) -> Result<String, ContractError> {
    let votes = get_votes();
    let votes_json = serde_json::to_string(&votes)
        .map_err(|e| ContractError::new(&format!("Serialization error: {}", e)))?;

    let response = ContractResponse {
        msg: votes_json,
    };
    serde_json::to_string(&response)
        .map_err(|e| ContractError::new(&format!("Serialization error: {}", e)))
}
*/

use rubixwasm_std::contract_fn;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize, Debug)]
pub struct ContractResponse {
    pub msg: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ContractError {
    pub msg: String,
}

impl ContractError {
    pub fn new(msg: &str) -> Self {
        ContractError {
            msg: msg.to_string(),
        }
    }
}

const ALLOWED_COLORS: [&str; 3] = ["Red", "Green", "Blue"];

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Vote {
    pub voter_id: String,
    pub color: String,
}

static mut VOTES: Option<Vec<Vote>> = None;

fn get_votes() -> &'static mut Vec<Vote> {
    unsafe {
        if VOTES.is_none() {
            VOTES = Some(Vec::new());
        }
        VOTES.as_mut().unwrap()
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CastAndTally {
    pub voter_id: String,
    pub color: String,
}

#[contract_fn]
pub fn cast_and_tally(input: CastAndTally) -> Result<String, ContractError> {
    if !ALLOWED_COLORS.contains(&input.color.as_str()) {
        return Err(ContractError::new("Invalid color"));
    }
    let votes = get_votes();
    votes.push(Vote {
        voter_id: input.voter_id.clone(),
        color: input.color.clone(),
    });

    let mut color_counts: HashMap<String, usize> = HashMap::new();
    for vote in votes.iter() {
        *color_counts.entry(vote.color.clone()).or_insert(0) += 1;
    }

    let winner = color_counts
        .iter()
        .max_by_key(|entry| entry.1)
        .map(|(color, _)| color.clone())
        .unwrap_or_else(|| "No votes yet".to_string());

    let msg = format!(
        "Vote cast for '{}'. Tally: {:?}. Winner: {}",
        input.color, color_counts, winner
    );

    let response = ContractResponse { msg };
    serde_json::to_string(&response)
        .map_err(|e| ContractError::new(&format!("Serialization error: {}", e)))
}

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

import axios from 'axios';
import { configService } from '../../../shared/services/config';

const STATUS_CHECK_URL = 'http://localhost:8080/request-status';
const STATUS_CHECK_INTERVAL = 6000; // 6 seconds

export interface FTInfo {
  creator_did: string;
  ft_count: number;
  ft_name: string;
}

interface FTResponse {
  ft_info: FTInfo[];
  message: string;
  result: string;
  status: boolean;
}

export interface CreateFTParams {
  tokenName: string;
  tokenSupply: string;
  rbtLocked: string;
  creatorDid: string;
}

export interface TransferFTParams {
  tokenName: string;
  amount: string;
  creatorDid: string;
  receiverDid: string;
}

interface SmartContractResponse {
  status: boolean;
  message: string;
  result: {
    id: string;
  };
}

interface SignatureResponse {
  status: boolean;
  message: string;
}

interface StatusResponse {
  status: number; // 0: Pending, 1: Success, 2: Failed
  message: string;
}

export const api = {
  async getFTsByDID(): Promise<FTInfo[]> {
    const config = await configService.getConfig();
    const { non_quorum_node_address, user_did } = config;

    if (!non_quorum_node_address || !user_did) {
      throw new Error('Node address and user DID are required');
    }

    const response = await fetch(
      `${non_quorum_node_address}/api/get-ft-info-by-did?did=${user_did}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch FT information');
    }

    const data: FTResponse = await response.json();
    return data.ft_info;
  },

  async pollStatus(contractHash: string, operation: 'mint' | 'transfer' = 'mint', signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          if (signal?.aborted) {
            reject(new Error('Operation cancelled'));
            return;
          }

          console.log(`Checking FT ${operation} status...`);
          const response = await axios.get<StatusResponse>(STATUS_CHECK_URL, {
            params: { req_id: `ft-${contractHash}-${operation}` },
            signal
          });

          console.log('Status response:', response.data);

          switch (response.data.status) {
            case 0: // Pending
              console.log(`FT ${operation} pending, checking again in 6 seconds...`);
              setTimeout(checkStatus, STATUS_CHECK_INTERVAL);
              break;
            case 1: // Success
              console.log(`FT ${operation} completed successfully`);
              resolve();
              break;
            case 2: // Failed
              console.error(`FT ${operation} failed`);
              reject(new Error(`FT ${operation} failed`));
              break;
            default:
              console.error('Unknown status:', response.data.status);
              reject(new Error('Unknown status received'));
          }
        } catch (error) {
          if (axios.isCancel(error)) {
            reject(new Error('Operation cancelled'));
          } else {
            console.error('Error checking status:', error);
            reject(error);
          }
        }
      };

      // Start polling
      checkStatus();
    });
  },

  async createFT(params: CreateFTParams, signal?: AbortSignal): Promise<void> {
    const config = await configService.getConfig();
    const { non_quorum_node_address, user_did, contracts_info } = config;

    if (!non_quorum_node_address || !user_did) {
      throw new Error('Node address and user DID are required');
    }

    try {
      // Step 1: Execute smart contract
      const smartContractData = {
        mint_sample_ft: {
          name: "rubix1",
          ft_info: {
            did: params.creatorDid,
            ft_count: parseInt(params.tokenSupply),
            ft_name: params.tokenName,
            token_count: parseInt(params.rbtLocked)
          }
        }
      };

      const executeRequest = {
        comment: `Create FT ${params.tokenName}`,
        executorAddr: user_did,
        quorumType: 2,
        smartContractData: JSON.stringify(smartContractData),
        smartContractToken: contracts_info.ft.contract_hash
      };

      console.log('Execute Request:', executeRequest);

      const executeResponse = await axios.post<SmartContractResponse>(
        `/api/execute-smart-contract`,
        executeRequest,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          signal
        }
      );

      console.log('Smart contract execution response:', executeResponse.data);

      if (!executeResponse.data.status) {
        throw new Error(executeResponse.data.message || 'Smart contract execution failed');
      }

      const requestId = executeResponse.data.result.id;

      // Step 2: Submit signature using the request ID
      console.log('Submitting signature for request:', requestId);

      const signatureRequest = {
        id: requestId,
        mode: 0,
        password: "mypassword"
      };

      const signatureResponse = await axios.post<SignatureResponse>(
        `/api/signature-response`,
        signatureRequest,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          signal
        }
      );

      console.log('Signature response:', signatureResponse.data);

      if (!signatureResponse.data.status) {
        throw new Error(signatureResponse.data.message || 'Signature submission failed');
      }

      // Step 3: Poll for creation status
      console.log('Starting to poll creation status...');
      await this.pollStatus(contracts_info.ft.contract_hash, 'mint', signal);
      console.log('FT creation process completed');
    } catch (error) {
      if (axios.isCancel(error)) {
        throw new Error('Operation cancelled');
      }
      console.error('Error in createFT:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(`Failed to create FT: ${errorMessage}`);
      }
      throw error;
    }
  },

  async transferFT(params: TransferFTParams, signal?: AbortSignal): Promise<void> {
    const config = await configService.getConfig();
    const { non_quorum_node_address, user_did, contracts_info } = config;

    if (!non_quorum_node_address || !user_did) {
      throw new Error('Node address and user DID are required');
    }

    try {
      // Step 1: Execute smart contract
      const smartContractData = {
        transfer_sample_ft: {
          name: "rubix1",
          ft_info: {
            comment: `Transfer ${params.amount} ${params.tokenName}`,
            ft_count: parseInt(params.amount),
            ft_name: params.tokenName,
            sender: user_did,
            creatorDID: params.creatorDid,
            receiver: params.receiverDid
          }
        }
      };

      const executeRequest = {
        comment: `Transfer FT ${params.tokenName}`,
        executorAddr: user_did,
        quorumType: 2,
        smartContractData: JSON.stringify(smartContractData),
        smartContractToken: contracts_info.ft.contract_hash
      };

      console.log('Execute Transfer Request:', executeRequest);

      const executeResponse = await axios.post<SmartContractResponse>(
        `/api/execute-smart-contract`,
        executeRequest,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          signal
        }
      );

      console.log('Smart contract execution response:', executeResponse.data);

      if (!executeResponse.data.status) {
        throw new Error(executeResponse.data.message || 'Smart contract execution failed');
      }

      const requestId = executeResponse.data.result.id;

      // Step 2: Submit signature using the request ID
      console.log('Submitting signature for request:', requestId);

      const signatureRequest = {
        id: requestId,
        mode: 0,
        password: "mypassword"
      };

      const signatureResponse = await axios.post<SignatureResponse>(
        `/api/signature-response`,
        signatureRequest,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          signal
        }
      );

      console.log('Signature response:', signatureResponse.data);

      if (!signatureResponse.data.status) {
        throw new Error(signatureResponse.data.message || 'Signature submission failed');
      }

      // Step 3: Poll for transfer status
      console.log('Starting to poll transfer status...');
      await this.pollStatus(contracts_info.ft.contract_hash, 'transfer', signal);
      console.log('FT transfer process completed');
    } catch (error) {
      if (axios.isCancel(error)) {
        throw new Error('Operation cancelled');
      }
      console.error('Error in transferFT:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(`Failed to transfer FT: ${errorMessage}`);
      }
      throw error;
    }
  }
};

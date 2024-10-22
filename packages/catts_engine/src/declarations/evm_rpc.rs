// This is an experimental feature to generate Rust binding from Candid.
// You may want to manually adjust some of the types.
#![allow(dead_code, unused_imports)]
use candid::{self, CandidType, Deserialize, Principal, Encode, Decode};
use ic_cdk::api::call::CallResult as Result;

pub type Regex = String;
#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum LogFilter { ShowAll, HideAll, ShowPattern(Regex), HidePattern(Regex) }

#[derive(Debug, CandidType, Deserialize, Clone)]
pub struct InstallArgs {
  pub logFilter: Option<LogFilter>,
  pub demo: Option<bool>,
  pub manageApiKeys: Option<Vec<Principal>>,
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum EthSepoliaService { Alchemy, BlockPi, PublicNode, Ankr, Sepolia }

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum L2MainnetService { Alchemy, Llama, BlockPi, PublicNode, Ankr }

pub type ChainId = u64;
#[derive(Debug, CandidType, Deserialize, Clone)]
pub struct HttpHeader { pub value: String, pub name: String }

#[derive(Debug, CandidType, Deserialize, Clone)]
pub struct RpcApi { pub url: String, pub headers: Option<Vec<HttpHeader>> }

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum EthMainnetService {
  Alchemy,
  Llama,
  BlockPi,
  Cloudflare,
  PublicNode,
  Ankr,
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum RpcServices {
  EthSepolia(Option<Vec<EthSepoliaService>>),
  BaseMainnet(Option<Vec<L2MainnetService>>),
  Custom{ chainId: ChainId, services: Vec<RpcApi> },
  OptimismMainnet(Option<Vec<L2MainnetService>>),
  ArbitrumOne(Option<Vec<L2MainnetService>>),
  EthMainnet(Option<Vec<EthMainnetService>>),
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum ConsensusStrategy { Equality, Threshold{ min: u8, total: Option<u8> } }

#[derive(Debug, CandidType, Deserialize, Clone)]
pub struct RpcConfig {
  pub responseConsensus: Option<ConsensusStrategy>,
  pub responseSizeEstimate: Option<u64>,
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub struct AccessListEntry { pub storageKeys: Vec<String>, pub address: String }

#[derive(Debug, CandidType, Deserialize, Clone)]
pub struct TransactionRequest {
  pub to: Option<String>,
  pub gas: Option<candid::Nat>,
  pub maxFeePerGas: Option<candid::Nat>,
  pub gasPrice: Option<candid::Nat>,
  pub value: Option<candid::Nat>,
  pub maxFeePerBlobGas: Option<candid::Nat>,
  pub from: Option<String>,
  pub r#type: Option<String>,
  pub accessList: Option<Vec<AccessListEntry>>,
  pub nonce: Option<candid::Nat>,
  pub maxPriorityFeePerGas: Option<candid::Nat>,
  pub blobs: Option<Vec<String>>,
  pub input: Option<String>,
  pub chainId: Option<candid::Nat>,
  pub blobVersionedHashes: Option<Vec<String>>,
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum BlockTag {
  Earliest,
  Safe,
  Finalized,
  Latest,
  Number(candid::Nat),
  Pending,
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub struct CallArgs {
  pub transaction: TransactionRequest,
  pub block: Option<BlockTag>,
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub struct JsonRpcError { pub code: i64, pub message: String }

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum ProviderError {
  TooFewCycles{ expected: candid::Nat, received: candid::Nat },
  InvalidRpcConfig(String),
  MissingRequiredProvider,
  ProviderNotFound,
  NoPermission,
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum ValidationError { Custom(String), InvalidHex(String) }

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum RejectionCode {
  NoError,
  CanisterError,
  SysTransient,
  DestinationInvalid,
  Unknown,
  SysFatal,
  CanisterReject,
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum HttpOutcallError {
  IcError{ code: RejectionCode, message: String },
  InvalidHttpJsonRpcResponse{
    status: u16,
    body: String,
    parsingError: Option<String>,
  },
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum RpcError {
  JsonRpcError(JsonRpcError),
  ProviderError(ProviderError),
  ValidationError(ValidationError),
  HttpOutcallError(HttpOutcallError),
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum CallResult { Ok(String), Err(RpcError) }

pub type ProviderId = u64;
#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum RpcService {
  EthSepolia(EthSepoliaService),
  BaseMainnet(L2MainnetService),
  Custom(RpcApi),
  OptimismMainnet(L2MainnetService),
  ArbitrumOne(L2MainnetService),
  EthMainnet(EthMainnetService),
  Provider(ProviderId),
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum MultiCallResult {
  Consistent(CallResult),
  Inconsistent(Vec<(RpcService,CallResult,)>),
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub struct FeeHistoryArgs {
  pub blockCount: candid::Nat,
  pub newestBlock: BlockTag,
  pub rewardPercentiles: Option<serde_bytes::ByteBuf>,
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub struct FeeHistory {
  pub reward: Vec<Vec<candid::Nat>>,
  pub gasUsedRatio: Vec<f64>,
  pub oldestBlock: candid::Nat,
  pub baseFeePerGas: Vec<candid::Nat>,
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum FeeHistoryResult { Ok(FeeHistory), Err(RpcError) }

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum MultiFeeHistoryResult {
  Consistent(FeeHistoryResult),
  Inconsistent(Vec<(RpcService,FeeHistoryResult,)>),
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub struct Block {
  pub miner: String,
  pub totalDifficulty: Option<candid::Nat>,
  pub receiptsRoot: String,
  pub stateRoot: String,
  pub hash: String,
  pub difficulty: Option<candid::Nat>,
  pub size: candid::Nat,
  pub uncles: Vec<String>,
  pub baseFeePerGas: Option<candid::Nat>,
  pub extraData: String,
  pub transactionsRoot: Option<String>,
  pub sha3Uncles: String,
  pub nonce: candid::Nat,
  pub number: candid::Nat,
  pub timestamp: candid::Nat,
  pub transactions: Vec<String>,
  pub gasLimit: candid::Nat,
  pub logsBloom: String,
  pub parentHash: String,
  pub gasUsed: candid::Nat,
  pub mixHash: String,
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum GetBlockByNumberResult { Ok(Block), Err(RpcError) }

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum MultiGetBlockByNumberResult {
  Consistent(GetBlockByNumberResult),
  Inconsistent(Vec<(RpcService,GetBlockByNumberResult,)>),
}

pub type Topic = Vec<String>;
#[derive(Debug, CandidType, Deserialize, Clone)]
pub struct GetLogsArgs {
  pub fromBlock: Option<BlockTag>,
  pub toBlock: Option<BlockTag>,
  pub addresses: Vec<String>,
  pub topics: Option<Vec<Topic>>,
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub struct LogEntry {
  pub transactionHash: Option<String>,
  pub blockNumber: Option<candid::Nat>,
  pub data: String,
  pub blockHash: Option<String>,
  pub transactionIndex: Option<candid::Nat>,
  pub topics: Vec<String>,
  pub address: String,
  pub logIndex: Option<candid::Nat>,
  pub removed: bool,
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum GetLogsResult { Ok(Vec<LogEntry>), Err(RpcError) }

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum MultiGetLogsResult {
  Consistent(GetLogsResult),
  Inconsistent(Vec<(RpcService,GetLogsResult,)>),
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub struct GetTransactionCountArgs { pub address: String, pub block: BlockTag }

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum GetTransactionCountResult { Ok(candid::Nat), Err(RpcError) }

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum MultiGetTransactionCountResult {
  Consistent(GetTransactionCountResult),
  Inconsistent(Vec<(RpcService,GetTransactionCountResult,)>),
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub struct TransactionReceipt {
  pub to: Option<String>,
  pub status: Option<candid::Nat>,
  pub transactionHash: String,
  pub blockNumber: candid::Nat,
  pub from: String,
  pub logs: Vec<LogEntry>,
  pub blockHash: String,
  pub r#type: String,
  pub transactionIndex: candid::Nat,
  pub effectiveGasPrice: candid::Nat,
  pub logsBloom: String,
  pub contractAddress: Option<String>,
  pub gasUsed: candid::Nat,
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum GetTransactionReceiptResult {
  Ok(Option<TransactionReceipt>),
  Err(RpcError),
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum MultiGetTransactionReceiptResult {
  Consistent(GetTransactionReceiptResult),
  Inconsistent(Vec<(RpcService,GetTransactionReceiptResult,)>),
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum SendRawTransactionStatus {
  Ok(Option<String>),
  NonceTooLow,
  NonceTooHigh,
  InsufficientFunds,
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum SendRawTransactionResult {
  Ok(SendRawTransactionStatus),
  Err(RpcError),
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum MultiSendRawTransactionResult {
  Consistent(SendRawTransactionResult),
  Inconsistent(Vec<(RpcService,SendRawTransactionResult,)>),
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub struct Metrics {
  pub cyclesWithdrawn: candid::Nat,
  pub responses: Vec<((String,String,String,),u64,)>,
  pub errNoPermission: u64,
  pub inconsistentResponses: Vec<((String,String,),u64,)>,
  pub cyclesCharged: Vec<((String,String,),candid::Nat,)>,
  pub requests: Vec<((String,String,),u64,)>,
  pub errHttpOutcall: Vec<((String,String,),u64,)>,
  pub errHostNotAllowed: Vec<(String,u64,)>,
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum RpcAuth {
  BearerToken{ url: String },
  UrlParameter{ urlPattern: String },
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum RpcAccess {
  Authenticated{ publicUrl: Option<String>, auth: RpcAuth },
  Unauthenticated{ publicUrl: String },
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub struct Provider {
  pub access: RpcAccess,
  pub alias: Option<RpcService>,
  pub chainId: ChainId,
  pub providerId: ProviderId,
}

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum RequestResult { Ok(String), Err(RpcError) }

#[derive(Debug, CandidType, Deserialize, Clone)]
pub enum RequestCostResult { Ok(candid::Nat), Err(RpcError) }

pub struct EvmRpc(pub Principal);
impl EvmRpc {
  pub async fn eth_call(
    &self,
    arg0: RpcServices,
    arg1: Option<RpcConfig>,
    arg2: CallArgs,
  ) -> Result<(MultiCallResult,)> {
    ic_cdk::call(self.0, "eth_call", (arg0,arg1,arg2,)).await
  }
  pub async fn eth_fee_history(
    &self,
    arg0: RpcServices,
    arg1: Option<RpcConfig>,
    arg2: FeeHistoryArgs,
  ) -> Result<(MultiFeeHistoryResult,)> {
    ic_cdk::call(self.0, "eth_feeHistory", (arg0,arg1,arg2,)).await
  }
  pub async fn eth_get_block_by_number(
    &self,
    arg0: RpcServices,
    arg1: Option<RpcConfig>,
    arg2: BlockTag,
  ) -> Result<(MultiGetBlockByNumberResult,)> {
    ic_cdk::call(self.0, "eth_getBlockByNumber", (arg0,arg1,arg2,)).await
  }
  pub async fn eth_get_logs(
    &self,
    arg0: RpcServices,
    arg1: Option<RpcConfig>,
    arg2: GetLogsArgs,
  ) -> Result<(MultiGetLogsResult,)> {
    ic_cdk::call(self.0, "eth_getLogs", (arg0,arg1,arg2,)).await
  }
  pub async fn eth_get_transaction_count(
    &self,
    arg0: RpcServices,
    arg1: Option<RpcConfig>,
    arg2: GetTransactionCountArgs,
  ) -> Result<(MultiGetTransactionCountResult,)> {
    ic_cdk::call(self.0, "eth_getTransactionCount", (arg0,arg1,arg2,)).await
  }
  pub async fn eth_get_transaction_receipt(
    &self,
    arg0: RpcServices,
    arg1: Option<RpcConfig>,
    arg2: String,
  ) -> Result<(MultiGetTransactionReceiptResult,)> {
    ic_cdk::call(self.0, "eth_getTransactionReceipt", (arg0,arg1,arg2,)).await
  }
  pub async fn eth_send_raw_transaction(
    &self,
    arg0: RpcServices,
    arg1: Option<RpcConfig>,
    arg2: String,
  ) -> Result<(MultiSendRawTransactionResult,)> {
    ic_cdk::call(self.0, "eth_sendRawTransaction", (arg0,arg1,arg2,)).await
  }
  pub async fn get_metrics(&self) -> Result<(Metrics,)> {
    ic_cdk::call(self.0, "getMetrics", ()).await
  }
  pub async fn get_nodes_in_subnet(&self) -> Result<(u32,)> {
    ic_cdk::call(self.0, "getNodesInSubnet", ()).await
  }
  pub async fn get_providers(&self) -> Result<(Vec<Provider>,)> {
    ic_cdk::call(self.0, "getProviders", ()).await
  }
  pub async fn get_service_provider_map(&self) -> Result<
    (Vec<(RpcService,ProviderId,)>,)
  > { ic_cdk::call(self.0, "getServiceProviderMap", ()).await }
  pub async fn request(
    &self,
    arg0: RpcService,
    arg1: String,
    arg2: u64,
  ) -> Result<(RequestResult,)> {
    ic_cdk::call(self.0, "request", (arg0,arg1,arg2,)).await
  }
  pub async fn request_cost(
    &self,
    arg0: RpcService,
    arg1: String,
    arg2: u64,
  ) -> Result<(RequestCostResult,)> {
    ic_cdk::call(self.0, "requestCost", (arg0,arg1,arg2,)).await
  }
  pub async fn update_api_keys(
    &self,
    arg0: Vec<(ProviderId,Option<String>,)>,
  ) -> Result<()> { ic_cdk::call(self.0, "updateApiKeys", (arg0,)).await }
}
pub const CANISTER_ID : Principal = Principal::from_slice(&[0, 0, 0, 0, 2, 48, 0, 204, 1, 1]); // 7hfb6-caaaa-aaaar-qadga-cai
pub const evm_rpc : EvmRpc = EvmRpc(CANISTER_ID);
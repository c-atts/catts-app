import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface CanisterSettingsInput {
  'ecdsa_key_id' : string,
  'siwe_provider_canister' : string,
  'evm_rpc_canister' : string,
}
export type ChangeLogAction = { 'Delete' : null } |
  { 'Create' : null } |
  { 'Update' : null };
export interface ChangeLogItem {
  'id' : string,
  'action' : ChangeLogAction,
  'type_name' : ChangeLogTypeName,
  'patch' : string,
}
export interface ChangeLogResponse {
  'data' : Array<IndexedChangeLogItem>,
  'total_count' : number,
}
export type ChangeLogTypeName = { 'Run' : null } |
  { 'Recipe' : null } |
  { 'User' : null };
export interface HttpError {
  'code' : number,
  'message' : string,
  'details' : [] | [string],
}
export interface HttpHeader { 'value' : string, 'name' : string }
export interface HttpResponse {
  'status' : bigint,
  'body' : Uint8Array | number[],
  'headers' : Array<HttpHeader>,
}
export interface IndexedChangeLogItem {
  'data' : ChangeLogItem,
  'index' : number,
}
export interface LogItem {
  'level' : LogLevel,
  'message' : string,
  'timestamp' : bigint,
}
export type LogLevel = { 'Error' : null } |
  { 'Info' : null } |
  { 'Warn' : null } |
  { 'Debug' : null };
export interface Recipe {
  'id' : Uint8Array | number[],
  'resolver' : string,
  'created' : number,
  'creator' : string,
  'schema' : string,
  'name' : string,
  'description' : [] | [string],
  'display_name' : [] | [string],
  'keywords' : [] | [Array<string>],
  'queries' : Array<RecipeQuery>,
  'publish_state' : RecipePublishState,
  'processor' : string,
  'revokable' : boolean,
}
export interface RecipeDetailsInput {
  'resolver' : string,
  'schema' : string,
  'name' : string,
  'description' : [] | [string],
  'display_name' : [] | [string],
  'keywords' : [] | [Array<string>],
  'queries' : Array<RecipeQuery>,
  'processor' : string,
  'revokable' : boolean,
}
export type RecipePublishState = { 'Draft' : null } |
  { 'Unpublished' : null } |
  { 'Published' : null };
export interface RecipeQuery {
  'endpoint' : string,
  'query' : string,
  'variables' : string,
}
export type Result = { 'Ok' : string } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : ChangeLogResponse } |
  { 'Err' : HttpError };
export type Result_2 = { 'Ok' : Recipe } |
  { 'Err' : HttpError };
export type Result_3 = { 'Ok' : string } |
  { 'Err' : HttpError };
export type Result_4 = { 'Ok' : Array<Recipe> } |
  { 'Err' : string };
export type Result_5 = { 'Ok' : Run } |
  { 'Err' : HttpError };
export type Result_6 = { 'Ok' : User } |
  { 'Err' : HttpError };
export interface Run {
  'id' : Uint8Array | number[],
  'gas' : [] | [bigint],
  'created' : number,
  'creator' : string,
  'user_fee' : [] | [bigint],
  'attestation_uid' : [] | [string],
  'attestation_transaction_hash' : [] | [string],
  'base_fee_per_gas' : [] | [bigint],
  'max_priority_fee_per_gas' : [] | [bigint],
  'recipe_id' : Uint8Array | number[],
  'payment_block_number' : [] | [bigint],
  'is_cancelled' : boolean,
  'error' : [] | [string],
  'chain_id' : number,
  'payment_log_index' : [] | [bigint],
  'payment_transaction_hash' : [] | [string],
}
export interface TransformArgs {
  'context' : Uint8Array | number[],
  'response' : HttpResponse,
}
export interface User { 'eth_address' : string }
export interface _SERVICE {
  'canister_eth_address' : ActorMethod<[], Result>,
  'change_log' : ActorMethod<[number, [] | [number]], Result_1>,
  'logs' : ActorMethod<[], Array<LogItem>>,
  'recipe_create' : ActorMethod<[RecipeDetailsInput, string], Result_2>,
  'recipe_delete' : ActorMethod<[Uint8Array | number[]], Result_2>,
  'recipe_get_by_id' : ActorMethod<[Uint8Array | number[]], Result_2>,
  'recipe_get_by_name' : ActorMethod<[string], Result_2>,
  'recipe_get_readme_by_id' : ActorMethod<[Uint8Array | number[]], Result_3>,
  'recipe_get_readme_by_name' : ActorMethod<[string], Result_3>,
  'recipe_list' : ActorMethod<[], Result_4>,
  'recipe_publish' : ActorMethod<[Uint8Array | number[]], Result_2>,
  'run_cancel' : ActorMethod<[Uint8Array | number[]], Result_5>,
  'run_create' : ActorMethod<[Uint8Array | number[], number], Result_5>,
  'run_get' : ActorMethod<[Uint8Array | number[]], Result_5>,
  'run_register_payment' : ActorMethod<
    [Uint8Array | number[], string, bigint],
    Result_5
  >,
  'transform' : ActorMethod<[TransformArgs], HttpResponse>,
  'user_create' : ActorMethod<[], Result_6>,
  'user_get' : ActorMethod<[], Result_6>,
  'user_get_by_eth_address' : ActorMethod<[string], Result_6>,
  'user_get_by_principal' : ActorMethod<[Uint8Array | number[]], Result_6>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];

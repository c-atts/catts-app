export const idlFactory = ({ IDL }) => {
  const CanisterSettingsInput = IDL.Record({
    'ecdsa_key_id' : IDL.Text,
    'siwe_provider_canister' : IDL.Text,
    'evm_rpc_canister' : IDL.Text,
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text });
  const ChangeLogAction = IDL.Variant({
    'Delete' : IDL.Null,
    'Create' : IDL.Null,
    'Update' : IDL.Null,
  });
  const ChangeLogTypeName = IDL.Variant({
    'Run' : IDL.Null,
    'Recipe' : IDL.Null,
    'User' : IDL.Null,
  });
  const ChangeLogItem = IDL.Record({
    'id' : IDL.Text,
    'action' : ChangeLogAction,
    'type_name' : ChangeLogTypeName,
    'patch' : IDL.Text,
  });
  const IndexedChangeLogItem = IDL.Record({
    'data' : ChangeLogItem,
    'index' : IDL.Nat32,
  });
  const ChangeLogResponse = IDL.Record({
    'data' : IDL.Vec(IndexedChangeLogItem),
    'total_count' : IDL.Nat32,
  });
  const HttpError = IDL.Record({
    'code' : IDL.Nat16,
    'message' : IDL.Text,
    'details' : IDL.Opt(IDL.Text),
  });
  const Result_1 = IDL.Variant({ 'Ok' : ChangeLogResponse, 'Err' : HttpError });
  const LogLevel = IDL.Variant({
    'Error' : IDL.Null,
    'Info' : IDL.Null,
    'Warn' : IDL.Null,
    'Debug' : IDL.Null,
  });
  const LogItem = IDL.Record({
    'level' : LogLevel,
    'message' : IDL.Text,
    'timestamp' : IDL.Nat64,
  });
  const RecipeQueryBody = IDL.Record({
    'query' : IDL.Text,
    'variables' : IDL.Text,
  });
  const RecipeQuery = IDL.Record({
    'url' : IDL.Text,
    'body' : IDL.Opt(RecipeQueryBody),
    'headers' : IDL.Opt(IDL.Text),
    'filter' : IDL.Opt(IDL.Text),
  });
  const RecipeDetailsInput = IDL.Record({
    'resolver' : IDL.Text,
    'schema' : IDL.Text,
    'name' : IDL.Text,
    'description' : IDL.Opt(IDL.Text),
    'keywords' : IDL.Opt(IDL.Vec(IDL.Text)),
    'queries' : IDL.Vec(RecipeQuery),
    'processor' : IDL.Text,
    'revokable' : IDL.Bool,
  });
  const RecipePublishState = IDL.Variant({
    'Draft' : IDL.Null,
    'Unpublished' : IDL.Null,
    'Published' : IDL.Null,
  });
  const Recipe = IDL.Record({
    'id' : IDL.Vec(IDL.Nat8),
    'resolver' : IDL.Text,
    'created' : IDL.Nat32,
    'creator' : IDL.Text,
    'schema' : IDL.Text,
    'name' : IDL.Text,
    'description' : IDL.Opt(IDL.Text),
    'keywords' : IDL.Opt(IDL.Vec(IDL.Text)),
    'queries' : IDL.Vec(RecipeQuery),
    'publish_state' : RecipePublishState,
    'processor' : IDL.Text,
    'revokable' : IDL.Bool,
  });
  const Result_2 = IDL.Variant({ 'Ok' : Recipe, 'Err' : HttpError });
  const Result_3 = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : HttpError });
  const Result_4 = IDL.Variant({ 'Ok' : IDL.Vec(Recipe), 'Err' : IDL.Text });
  const Run = IDL.Record({
    'id' : IDL.Vec(IDL.Nat8),
    'gas' : IDL.Opt(IDL.Nat),
    'created' : IDL.Nat32,
    'creator' : IDL.Text,
    'user_fee' : IDL.Opt(IDL.Nat),
    'attestation_uid' : IDL.Opt(IDL.Text),
    'attestation_transaction_hash' : IDL.Opt(IDL.Text),
    'base_fee_per_gas' : IDL.Opt(IDL.Nat),
    'max_priority_fee_per_gas' : IDL.Opt(IDL.Nat),
    'recipe_id' : IDL.Vec(IDL.Nat8),
    'payment_block_number' : IDL.Opt(IDL.Nat),
    'is_cancelled' : IDL.Bool,
    'error' : IDL.Opt(IDL.Text),
    'chain_id' : IDL.Nat32,
    'payment_log_index' : IDL.Opt(IDL.Nat),
    'payment_transaction_hash' : IDL.Opt(IDL.Text),
  });
  const Result_5 = IDL.Variant({ 'Ok' : Run, 'Err' : HttpError });
  const HttpHeader = IDL.Record({ 'value' : IDL.Text, 'name' : IDL.Text });
  const HttpResponse = IDL.Record({
    'status' : IDL.Nat,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HttpHeader),
  });
  const TransformArgs = IDL.Record({
    'context' : IDL.Vec(IDL.Nat8),
    'response' : HttpResponse,
  });
  const User = IDL.Record({ 'eth_address' : IDL.Text });
  const Result_6 = IDL.Variant({ 'Ok' : User, 'Err' : HttpError });
  return IDL.Service({
    'canister_eth_address' : IDL.Func([], [Result], []),
    'change_log' : IDL.Func(
        [IDL.Nat32, IDL.Opt(IDL.Nat32)],
        [Result_1],
        ['query'],
      ),
    'logs' : IDL.Func([], [IDL.Vec(LogItem)], ['query']),
    'recipe_create' : IDL.Func([RecipeDetailsInput, IDL.Text], [Result_2], []),
    'recipe_delete' : IDL.Func([IDL.Vec(IDL.Nat8)], [Result_2], []),
    'recipe_get_by_id' : IDL.Func([IDL.Vec(IDL.Nat8)], [Result_2], ['query']),
    'recipe_get_by_name' : IDL.Func([IDL.Text], [Result_2], ['query']),
    'recipe_get_readme_by_id' : IDL.Func(
        [IDL.Vec(IDL.Nat8)],
        [Result_3],
        ['query'],
      ),
    'recipe_get_readme_by_name' : IDL.Func([IDL.Text], [Result_3], ['query']),
    'recipe_list' : IDL.Func([], [Result_4], ['query']),
    'recipe_publish' : IDL.Func([IDL.Vec(IDL.Nat8)], [Result_2], []),
    'run_cancel' : IDL.Func([IDL.Vec(IDL.Nat8)], [Result_5], []),
    'run_create' : IDL.Func([IDL.Vec(IDL.Nat8), IDL.Nat32], [Result_5], []),
    'run_get' : IDL.Func([IDL.Vec(IDL.Nat8)], [Result_5], ['query']),
    'run_register_payment' : IDL.Func(
        [IDL.Vec(IDL.Nat8), IDL.Text, IDL.Nat],
        [Result_5],
        [],
      ),
    'transform' : IDL.Func([TransformArgs], [HttpResponse], ['query']),
    'user_create' : IDL.Func([], [Result_6], []),
    'user_get' : IDL.Func([], [Result_6], ['query']),
    'user_get_by_eth_address' : IDL.Func([IDL.Text], [Result_6], ['query']),
    'user_get_by_principal' : IDL.Func(
        [IDL.Vec(IDL.Nat8)],
        [Result_6],
        ['query'],
      ),
  });
};
export const init = ({ IDL }) => {
  const CanisterSettingsInput = IDL.Record({
    'ecdsa_key_id' : IDL.Text,
    'siwe_provider_canister' : IDL.Text,
    'evm_rpc_canister' : IDL.Text,
  });
  return [CanisterSettingsInput];
};

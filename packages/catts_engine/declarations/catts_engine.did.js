export const idlFactory = ({ IDL }) => {
  const CanisterSettingsInput = IDL.Record({
    'ecdsa_key_id' : IDL.Text,
    'siwe_provider_canister' : IDL.Text,
    'evm_rpc_canister' : IDL.Text,
  });
  const Result = IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text });
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
  const RecipeQuery = IDL.Record({
    'endpoint' : IDL.Text,
    'query' : IDL.Text,
    'variables' : IDL.Text,
  });
  const RecipeDetailsInput = IDL.Record({
    'resolver' : IDL.Text,
    'schema' : IDL.Text,
    'name' : IDL.Text,
    'description' : IDL.Opt(IDL.Text),
    'display_name' : IDL.Opt(IDL.Text),
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
    'gas' : IDL.Opt(IDL.Nat),
    'resolver' : IDL.Text,
    'created' : IDL.Nat64,
    'creator' : IDL.Vec(IDL.Nat8),
    'schema' : IDL.Text,
    'name' : IDL.Text,
    'description' : IDL.Opt(IDL.Text),
    'display_name' : IDL.Opt(IDL.Text),
    'keywords' : IDL.Opt(IDL.Vec(IDL.Text)),
    'queries' : IDL.Vec(RecipeQuery),
    'publish_state' : RecipePublishState,
    'processor' : IDL.Text,
    'revokable' : IDL.Bool,
  });
  const Error = IDL.Record({
    'code' : IDL.Nat16,
    'message' : IDL.Text,
    'details' : IDL.Opt(IDL.Text),
  });
  const Result_1 = IDL.Variant({ 'Ok' : Recipe, 'Err' : Error });
  const Result_2 = IDL.Variant({ 'Ok' : IDL.Vec(Recipe), 'Err' : IDL.Text });
  const PaymentVerifiedStatus = IDL.Variant({
    'VerificationFailed' : IDL.Null,
    'Verified' : IDL.Null,
    'Pending' : IDL.Null,
  });
  const Run = IDL.Record({
    'id' : IDL.Vec(IDL.Nat8),
    'fee' : IDL.Nat,
    'created' : IDL.Nat64,
    'creator' : IDL.Vec(IDL.Nat8),
    'attestation_uid' : IDL.Opt(IDL.Text),
    'attestation_transaction_hash' : IDL.Opt(IDL.Text),
    'recipe_id' : IDL.Vec(IDL.Nat8),
    'is_cancelled' : IDL.Bool,
    'chain_id' : IDL.Nat64,
    'attestation_create_error' : IDL.Opt(IDL.Text),
    'payment_verified_status' : IDL.Opt(PaymentVerifiedStatus),
    'payment_transaction_hash' : IDL.Opt(IDL.Text),
  });
  const Result_3 = IDL.Variant({ 'Ok' : Run, 'Err' : Error });
  const Result_4 = IDL.Variant({ 'Ok' : IDL.Vec(Run), 'Err' : Error });
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
  const Result_5 = IDL.Variant({ 'Ok' : User, 'Err' : Error });
  return IDL.Service({
    'canister_eth_address' : IDL.Func([], [Result], []),
    'logs' : IDL.Func([], [IDL.Vec(LogItem)], ['query']),
    'recipe_create' : IDL.Func([RecipeDetailsInput, IDL.Text], [Result_1], []),
    'recipe_get_by_id' : IDL.Func([IDL.Vec(IDL.Nat8)], [Result_1], ['query']),
    'recipe_get_by_name' : IDL.Func([IDL.Text], [Result_1], ['query']),
    'recipe_list' : IDL.Func([], [Result_2], ['query']),
    'recipe_publish' : IDL.Func([IDL.Vec(IDL.Nat8)], [Result_1], []),
    'run_cancel' : IDL.Func([IDL.Vec(IDL.Nat8)], [Result_3], []),
    'run_create' : IDL.Func([IDL.Vec(IDL.Nat8), IDL.Nat64], [Result_3], []),
    'run_get' : IDL.Func([IDL.Vec(IDL.Nat8)], [Result_3], ['query']),
    'run_list_for_user' : IDL.Func([], [Result_4], []),
    'run_register_payment' : IDL.Func(
        [IDL.Vec(IDL.Nat8), IDL.Text, IDL.Nat],
        [Result_3],
        [],
      ),
    'transform' : IDL.Func([TransformArgs], [HttpResponse], ['query']),
    'user_create' : IDL.Func([], [Result_5], []),
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
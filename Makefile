create-canisters:
	dfx canister create --all

deploy-evm-rpc:
	dfx deploy evm_rpc --with-cycles 1t --argument "( \
		record { \
			nodesInSubnet = 25; \
		} \
	)"

deploy-siwe:
	dfx deploy ic_siwe_provider --argument "( \
	    record { \
	        domain = \"127.0.0.1\"; \
	        uri = \"http://127.0.0.1:5173\"; \
	        salt = \"salt\"; \
	        chain_id = opt 1; \
	        scheme = opt \"http\"; \
	        statement = opt \"Login to the SIWE/IC demo app\"; \
	        sign_in_expires_in = opt 300000000000; /* 5 minutes */ \
	        session_expires_in = opt 604800000000000; /* 1 week */ \
	        targets = opt vec { \
	            \"$$(dfx canister id ic_siwe_provider)\"; \
	            \"$$(dfx canister id catts_engine)\"; \
	        }; \
	    } \
	)"

upgrade-siwe:
	dfx canister install ic_siwe_provider --mode upgrade --upgrade-unchanged --argument "( \
	    record { \
	        domain = \"127.0.0.1\"; \
	        uri = \"http://127.0.0.1:5173\"; \
	        salt = \"salt\"; \
	        chain_id = opt 1; \
	        scheme = opt \"http\"; \
	        statement = opt \"Login to the SIWE/IC demo app\"; \
	        sign_in_expires_in = opt 300000000000; /* 5 minutes */ \
	        session_expires_in = opt 604800000000000; /* 1 week */ \
	        targets = opt vec { \
	            \"$$(dfx canister id ic_siwe_provider)\"; \
	            \"$$(dfx canister id catts_engine)\"; \
	        }; \
	    } \
	)"

deploy-engine:
	export CANISTER_CANDID_PATH_IC_SIWE_PROVIDER=../ic_siwe_provider/ic_siwe_provider.did && \
	export CANISTER_CANDID_PATH_EVM_RPC=../evm_rpc/evm_rpc.did && \
	cargo build --target wasm32-wasi && \
	cargo build --release --target wasm32-wasi && \
	cd ./target/wasm32-wasi/release && \
	wasi2ic catts_engine.wasm catts_engine.wasm && \
	candid-extractor catts_engine.wasm > ../../../packages/catts_engine/catts_engine.did && \
	ic-wasm catts_engine.wasm -o catts_engine.wasm metadata candid:service -f ../../../packages/catts_engine/catts_engine.did -v public && \
	gzip -c catts_engine.wasm > catts_engine.wasm.gz && \
	dfx deploy catts_engine --argument "(\"dfx_test_key\")"

deploy-frontend:
	dfx generate
	npm install
	dfx deploy catts_frontend

deploy-all: create-canisters deploy-siwe deploy-evm-rpc deploy-engine deploy-frontend

run-frontend:
	npm install
	npm run dev -w catts_frontend

clean:
	rm -rf .dfx
	rm -rf node_modules
	rm -rf packages/catts_engine/declarations
	rm -rf packages/catts_engine/src/declarations
	rm -rf packages/catts_frontend/declarations
	rm -rf packages/catts_frontend/dist
	rm -rf packages/catts_payments/artifacts
	rm -rf packages/catts_payments/cache
	rm -rf packages/catts_payments/coverage
	rm -rf packages/catts_payments/typechain-types
	rm -rf packages/catts_payments/coverage.json
	rm -rf packages/evm_rpc/declarations
	rm -rf packages/ic_siwe_provider/declarations
	rm -rf target
	rm -f .env
	cargo clean

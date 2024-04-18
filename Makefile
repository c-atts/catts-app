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
	            \"$$(dfx canister id backend)\"; \
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
	            \"$$(dfx canister id backend)\"; \
	        }; \
	    } \
	)"

deploy-catts:
	export CANISTER_CANDID_PATH_IC_SIWE_PROVIDER=../ic_siwe_provider/ic_siwe_provider.did && \
	export CANISTER_CANDID_PATH_EVM_RPC=../evm_rpc/evm_rpc.did && \
	cargo build --target wasm32-wasi && \
	cargo build --release --target wasm32-wasi && \
	cd ./target/wasm32-wasi/release && \
	wasi2ic backend.wasm backend.wasm && \
	candid-extractor backend.wasm > ../../../src/backend/backend.did && \
	ic-wasm backend.wasm -o backend.wasm metadata candid:service -f ../../../src/backend/backend.did -v public && \
	gzip -c backend.wasm > backend.wasm.gz && \
	dfx deploy backend --argument "(\"dfx_test_key\")"

deploy-frontend:
	npm install
	dfx deploy frontend

deploy-all: create-canisters deploy-siwe deploy-evm-rpc deploy-catts deploy-frontend

run-frontend:
	npm install
	npm run dev

clean:
	rm -rf .dfx
	rm -rf dist
	rm -rf node_modules
	rm -rf src/declarations
	rm -rf src/backend/src/declarations
	rm -f .env
	cargo clean


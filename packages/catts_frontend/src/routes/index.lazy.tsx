import { createLazyFileRoute, Link } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex flex-col items-center w-full bg-landing-1">
        <div className="flex flex-col w-full xl:w-[1280px] py-32 px-10 xl:px-0">
          <div className="flex flex-col w-full">
            <div className="text-5xl md:text-6xl xl:text-7xl font-semibold text-center md:text-left md:w-[500px] xl:w-[730px] leading-tight pb-16 md:pb-[150px] text-accent-foreground/90">
              Attest to Any Onchain Data
            </div>
            <div className="flex flex-col justify-between w-full md:flex-row">
              <div className="flex items-center justify-center w-full gap-10 pb-10 md:w-fit md:items-end md:pb-0">
                <img
                  className="w-10 h-10 xl:w-20 xl:h-20"
                  src="/ethereum.svg"
                />
                <img
                  className="w-10 h-10 xl:w-20 xl:h-20"
                  src="/optimism.svg"
                />
                <img className="w-10 h-10 xl:w-20 xl:h-20" src="/base.svg" />
                <img
                  className="w-10 h-10 xl:w-20 xl:h-20"
                  src="/arbitrum.svg"
                />
              </div>
              <div className="md:w-[300px] xl:w-[450px] text-center text-accent-foreground/90 text-lg xl:text-xl leading-relaxed md:text-right">
                If you can query the data, you can attest to it!{" "}
                <span className="whitespace-nowrap">C–ATTS</span> lets you to
                attest to a wide range of onchain data, making it easy to create
                secure and verifiable credentials. Whether it’s <b>identity</b>,{" "}
                <b>reputation</b>, or <b>transaction data</b>, you can generate
                attestations on multiple L1s and L2s.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-col items-center justify-center w-full lg:hidden">
        <div className="flex flex-col items-center w-full py-20">
          <div className="flex justify-between w-full">
            <div className="flex justify-between w-full">
              <div className="flex flex-col gap-14">
                <div className="text-5xl font-semibold leading-tight text-center md:text-6xl xl:text-7xl text-muted-foreground">
                  Transform, combine and migrate attestations
                </div>

                <div className="w-full px-10 text-lg leading-relaxed text-center text-accent-foreground/90">
                  Run any number of queries on the{" "}
                  <a
                    className="classic-link"
                    href="https://attest.org"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Ethereum Attestation Service
                  </a>
                  ,{" "}
                  <a
                    className="classic-link"
                    href="https://thegraph.com"
                    rel="noreferrer"
                    target="_blank"
                  >
                    The Graph
                  </a>
                  ,{" "}
                  <a
                    className="classic-link"
                    href="https://moralis.io/api"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Moralis
                  </a>{" "}
                  or <b>any open Rest/GraphQL API</b>. The C–ATTS engine
                  processes the query results using any logic or algorithm and
                  creates composite EAS attestations.
                </div>
                <div className="flex justify-center w-full gap-10">
                  <img className="w-12 h-12" src="/thegraph.svg" />
                  <img className="w-12 h-12" src="/eas.png" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-col items-center justify-center hidden w-full lg:flex">
        <div className="flex flex-col xl:w-[1280px] py-32 items-center px-10 xl:px-0 gap-20">
          <div className="flex justify-between w-full">
            <div className="flex flex-col">
              <div className="flex gap-10 pb-10">
                <img className="w-12 h-12" src="/thegraph.svg" />
                <img className="w-12 h-12" src="/eas.png" />
              </div>

              <div className="w-[350px] xl:w-[450px] text-accent-foreground/90 text-lg xl:text-xl leading-relaxed">
                Run any number of queries on the{" "}
                <a
                  className="classic-link"
                  href="https://attest.org"
                  rel="noreferrer"
                  target="_blank"
                >
                  Ethereum Attestation Service
                </a>
                ,{" "}
                <a
                  className="classic-link"
                  href="https://thegraph.com"
                  rel="noreferrer"
                  target="_blank"
                >
                  The Graph
                </a>
                ,{" "}
                <a
                  className="classic-link"
                  href="https://moralis.io/api"
                  rel="noreferrer"
                  target="_blank"
                >
                  Moralis
                </a>{" "}
                or <b>any open Rest/GraphQL API</b>. The C–ATTS engine processes
                the query results using any logic or algorithm and creates
                composite EAS attestations.
              </div>
            </div>
            <div className="text-5xl md:text-6xl xl:text-7xl font-semibold w-[500px] xl:w-[730px] leading-tight pb-28 text-muted-foreground text-right">
              Transform, combine and migrate attestations
            </div>
          </div>
          <img className="w-[80%] pb-10" src="/diagram.svg" />
        </div>
      </div>

      <div className="flex flex-col items-center w-full pb-20 lg:pb-32">
        <div className="flex flex-col w-full xl:w-[1280px] px-5 xl:px-0">
          <div className="flex flex-col justify-between w-full gap-10 xl:flex-row">
            <div className="justify-between w-full p-10 bg-muted-foreground md:p-20 flex-flex-col">
              <div className="flex justify-end w-full pb-14">
                <img className="w-1/3" src="/ic.svg" />
              </div>
              <div className="w-2/3 pb-20 text-5xl font-medium leading-tight text-card">
                Powered by Chain Fusion
              </div>
              <div className="w-full md:w-[450px] text-card text-lg xl:text-xl leading-relaxed">
                C–ATTS operates at the intersection of multiple blockchains. All
                queries and processing logic run securely in smart contracts on
                the{" "}
                <a
                  className="classic-link whitespace-nowrap"
                  href="https://internetcomputer.org"
                  rel="noreferrer"
                  target="_blank"
                >
                  Internet Computer
                </a>
                . Thanks to the chain fusion capabilities of IC, the smart
                ontracts can create attestations on multiple Ethereum L1s and
                L2s without the need for bridges.
              </div>
            </div>
            <div className="flex flex-col justify-between w-full gap-10 p-10 bg-muted-foreground md:p-20">
              <div className="flex justify-end w-full pb-20 md:pb-32">
                <div className="w-3/4 text-5xl font-medium leading-tight text-right text-card">
                  Define Custom Recipes
                </div>
              </div>
              <div className="w-full pb-1 text-lg leading-relaxed text-right text-card xl:text-xl">
                C–ATTS recipes define the queries and the processing logic
                needed to create composite attestations. Recipes consist of
                standard <b>GraphQL</b> queries and a <b>JavaScript</b>. Recipes
                can be created by anyone, tested locally, and then published and
                stored onchain.
              </div>
              <div className="flex justify-end w-full gap-10">
                <img className="w-12 h-12" src="/gql.png" />
                <img className="w-12 h-12" src="/js.png" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center w-full bg-landing-2">
        <div className="flex flex-col xl:w-[1280px] py-20 lg:py-28 px-5">
          <div className="flex flex-col w-full">
            <div className="w-full pb-20 text-5xl font-semibold leading-tight text-center text-muted-foreground md:text-6xl xl:text-7xl">
              Discover the power of{" "}
              <span className="whitespace-nowrap">C–ATTS</span>, start creating
              composite attestations today.
            </div>
            <div className="flex justify-center w-full">
              <Link to="/explorer">
                <div className="py-8 text-3xl font-medium text-center text-white rounded-full bg-primary px-14 hover-darken">
                  Start Exploring
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

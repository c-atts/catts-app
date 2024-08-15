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
            <div className="flex flex-col md:flex-row justify-between w-full">
              <div className="flex w-full md:w-fit justify-center items-center md:items-end gap-10 pb-10 md:pb-0">
                <img
                  className="w-10 xl:w-20 h-10 xl:h-20"
                  src="/ethereum.svg"
                />
                <img
                  className="w-10 xl:w-20 h-10 xl:h-20"
                  src="/optimism.svg"
                />
                <img className="w-10 xl:w-20 h-10 xl:h-20" src="/base.svg" />
                <img
                  className="w-10 xl:w-20 h-10 xl:h-20"
                  src="/arbitrum.svg"
                />
              </div>
              <div className="md:w-[300px] xl:w-[450px] text-center text-accent-foreground/90 text-lg xl:text-xl leading-relaxed md:text-right">
                If you can query the data, you can attest to it!{" "}
                <nobr>C–ATTS</nobr> lets you to attest to a wide range of
                onchain data, making it easy to create secure and verifiable
                credentials. Whether it’s <b>identity</b>, <b>reputation</b>, or{" "}
                <b>transaction data</b>, you can generate attestations on
                multiple L1s and L2s.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden flex-col items-center justify-center w-full">
        <div className="flex flex-col w-full py-20 items-center">
          <div className="flex w-full justify-between">
            <div className="flex justify-between w-full">
              <div className="flex flex-col gap-14">
                <div className="text-5xl md:text-6xl xl:text-7xl font-semibold leading-tight text-muted-foreground text-center">
                  Transform, combine and migrate attestations
                </div>

                <div className="w-full text-accent-foreground/90 text-lg leading-relaxed px-10 text-center">
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
                  </a>{" "}
                  or <b>any other data source</b> that supports GraphQL. The
                  C–ATTS engine processes the query results using any logic or
                  algorithm and creates composite EAS attestations.
                </div>
                <div className="flex w-full gap-10 justify-center">
                  <img className="w-12 h-12" src="/thegraph.svg" />
                  <img className="w-12 h-12" src="/eas.png" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-col items-center justify-center w-full">
        <div className="flex flex-col xl:w-[1280px] py-32 items-center px-10 xl:px-0 gap-20">
          <div className="flex w-full justify-between">
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
                </a>{" "}
                or <b>any other data source</b> that supports GraphQL. The
                C–ATTS engine processes the query results using any logic or
                algorithm and creates composite EAS attestations.
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
          <div className="flex flex-col xl:flex-row justify-between w-full gap-10">
            <div className="w-full bg-muted-foreground p-10 md:p-20 flex-flex-col justify-between">
              <div className="flex w-full justify-end pb-14">
                <img className="w-1/3" src="/ic.svg" />
              </div>
              <div className="pb-20 text-card text-5xl leading-tight font-medium w-2/3">
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
            <div className="w-full bg-muted-foreground p-10 md:p-20 flex flex-col justify-between gap-10">
              <div className="w-full flex justify-end pb-20 md:pb-32">
                <div className="text-card text-5xl leading-tight font-medium w-3/4 text-right">
                  Define Custom Recipes
                </div>
              </div>
              <div className="w-full text-card text-lg xl:text-xl leading-relaxed pb-1 text-right">
                C–ATTS recipes define the queries and the processing logic
                needed to create composite attestations. Recipes consist of
                standard <b>GraphQL</b> queries and a <b>JavaScript</b>. Recipes
                can be created by anyone, tested locally, and then published and
                stored onchain.
              </div>
              <div className="flex w-full justify-end gap-10">
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
            <div className="w-full font-semibold leading-tight text-muted-foreground text-5xl md:text-6xl xl:text-7xl text-center pb-20">
              Discover the power of <nobr>C–ATTS</nobr>, start creating
              composite attestations today.
            </div>
            <div className="w-full flex justify-center">
              <Link to="/explorer">
                <div className="bg-primary px-14 py-8 rounded-full text-white text-3xl font-medium text-center hover-darken">
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

import EcommerceMetrics from "../../components/Projects/EcommerceMetrics";
import MonthlySalesChart from "../../components/Projects/MonthlySalesChart";
// import StatisticsChart from "../../components/ecommerce/StatisticsChart";
// import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import CurrentProjects from "../../components/Projects/CurrentProjects";
// import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
  return (
    <>
      <PageMeta
        title="HistoAI - Graphiti Multimedia"
        description="This is a Web application based AI Tool named HistoAI."
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />

          <MonthlySalesChart />
        </div>
        <div className="col-span-12 xl:col-span-5">
          <CurrentProjects />
        </div>
        {/* <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div> */}

        {/* <div className="col-span-12 ">
          <StatisticsChart />
        </div> */}

        {/* <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div> */}

        
      </div>
    </>
  );
}





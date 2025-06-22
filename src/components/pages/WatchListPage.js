import React, { useState, useEffect } from "react";
import SideBar from "../SideBar";
import ChartWrapper from "./tradePageComponents/ChartWrapper";

// --- Main Watch List Page Component ---
function WatchListPage(props) {
  const [watchListData, setWatchListData] = useState({});

  const fetchWatchListData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}api/watchList/get`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": `${localStorage.getItem("token")}`,
          },
        }
      );
      const res = await response.json();
      if (res.success) {
        setWatchListData(res.watchList);
      } else {
        console.error(
          "Error fetching WatchList: ",
          res.msg || res.errors || "error"
        );
        props.showAlert(
          res.msg || (res.errors && res.errors[0]?.msg) || "An error occurred",
          "danger"
        );
      }
    } catch (error) {
      console.error("Error Fetching Details: ", error);
      props.showAlert(
        "Something went wrong! Please try again later.",
        "danger"
      );
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/";
      return;
    }
    fetchWatchListData();
    // eslint-disable-next-line
  }, []);

  const mainContentStyle = {
    marginLeft: "280px",
    paddingLeft: "20px",
    paddingRight: "50px",
    width: "calc(100% - 280px)",
    boxSizing: "border-box",
    backgroundColor: "#212529",
    minHeight: "100vh",
  };
  const pageWrapperStyle = { minHeight: "100vh" };

  return (
    <div data-bs-theme="dark" style={pageWrapperStyle}>
      <SideBar />
      <div className="py-4" style={mainContentStyle}>
        <h1 className="text-center text-white mb-3">WatchList</h1>

        {
          <h2 className="text-white mt-4 mb-3">{`Stocks in WatchList`}</h2>
        }
        <div className="row">
          {watchListData.length > 0
            ? watchListData.map((company) => (
                <ChartWrapper
                  key={company.company_id}
                  stockSymbol={company.symbol}
                  stockName={company.name}
                  company_id={company.company_id}
                  showAlert={props.showAlert}
                />
              ))
            : (
                <div className="col-12">
                  <div className="alert alert-info">
                    {" "}
                    No Companies added in WatchList, Add companies to WatchList to see them here.{" "}
                  </div>
                </div>
              )}
        </div>
      </div>
    </div>
  );
}

export default WatchListPage;
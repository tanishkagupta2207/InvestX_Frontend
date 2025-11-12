import { useState, useEffect, useCallback, useMemo } from "react";

// Helper function to calculate total value of a set of holdings
const calculateHoldingsValue = (holdings) => {
    let total = 0;
    // FIX 1: Add Array.isArray check
    if (holdings && Array.isArray(holdings)) { 
        holdings.forEach(item => {
            // Note: If using the combined array, the price fields must be consistent (e.g., current_price or nav)
            const price = item.current_price || item.nav || 0;
            total += (item.quantity * price);
        });
    }
    return total;
};

// Helper function to calculate total invested value
const calculateInvestedValue = (holdings) => {
    let total = 0;
    // FIX 2: Add Array.isArray check
    if (holdings && Array.isArray(holdings)) {
        holdings.forEach(item => {
            const price = item.average_price || 0; // Assuming average_price for invested capital
            total += (item.quantity * price);
        });
    }
    return total;
}

// Helper function to calculate total profit/loss
const calculateTotalProfit = (holdings) => {
    const currentValue = calculateHoldingsValue(holdings);
    const investedValue = calculateInvestedValue(holdings);
    return parseFloat((currentValue - investedValue).toFixed(3));
};


export const usePortfolioData = (identifier, token, mode, showAlert) => {
    const [portfolioData, setPortfolioData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPortfolioData = useCallback(async () => {
        if (!identifier && mode !== 'dashboard') {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        
        let url;
        let headers = { "Content-Type": "application/json" };
        
        if (mode === 'dashboard') {
            url = `${process.env.REACT_APP_HOST_URL}api/portfolio/getPortfolio`;
            headers["auth-token"] = token;
        } else if (mode === 'public') {
            url = `${process.env.REACT_APP_HOST_URL}api/portfolio/${identifier}`;
        } else {
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: headers,
            });
            const res = await response.json();
            if (res.success) {
                setPortfolioData(res.data);
            } else {
                showAlert(
                    res.msg || (res.errors && res.errors[0]?.msg) || "An error occurred fetching portfolio.",
                    "danger"
                );
            }
        } catch (error) {
            showAlert("Something went wrong with the portfolio API call.", "danger");
        } finally {
            setIsLoading(false);
        }
    }, [identifier, token, mode, showAlert]);

    useEffect(() => {
        fetchPortfolioData();
        // eslint-disable-next-line
    }, [token, identifier, mode]);

    // --- Core Metric Calculations ---
    const calculatedMetrics = useMemo(() => {
        if (!portfolioData) {
            return {
                totalValue: 0,
                cashHeld: 0,
                moneyInvested: 0,
                totalProfit: 0,
                xirr: null,
                holdings: [],
                isPositiveChange: true,
                holdingsValue: 0
            };
        }
        
        // 🎯 FIX 3: COMBINE STOCKS AND MUTUAL FUNDS INTO ONE ARRAY
        const stocks = portfolioData.stocks && Array.isArray(portfolioData.stocks) ? portfolioData.stocks : [];
        const mutualFunds = portfolioData.mutualFunds && Array.isArray(portfolioData.mutualFunds) ? portfolioData.mutualFunds : [];
        
        // Ensure that each object has 'security_type' set for chart grouping (assuming backend ensures this)
        const combinedHoldings = [
            ...stocks.map(s => ({ ...s, security_type: 'company' })),
            ...mutualFunds.map(m => ({ ...m, security_type: 'mutualfund' }))
        ];
        
        const cashHeld = portfolioData.Balance || 0;
        
        // Calculate core holding values using the combined array
        const totalHoldingsValue = calculateHoldingsValue(combinedHoldings);
        const totalInvestedValue = calculateInvestedValue(combinedHoldings);
        const totalProfit = calculateTotalProfit(combinedHoldings);
        
        const totalValue = parseFloat((totalHoldingsValue + cashHeld).toFixed(3));

        return {
            totalValue,
            cashHeld: parseFloat(cashHeld.toFixed(3)),
            moneyInvested: parseFloat(totalInvestedValue.toFixed(3)),
            totalProfit,
            xirr: portfolioData.xirr || null,
            holdings: combinedHoldings, // Return the combined array
            isPositiveChange: totalProfit >= 0,
            holdingsValue: totalHoldingsValue
        };
    }, [portfolioData]);
    
    // --- Chart Data Preparation (for Stocks, MFs, Cash) ---
    const chartAllocationData = useMemo(() => {
        const { totalValue, cashHeld, holdings } = calculatedMetrics; 

        if (totalValue === 0 || !Array.isArray(holdings)) return null; 
        
        // FIX 4: Group holdings by type using the combined and verified array
        const allocationByType = holdings.reduce((acc, holding) => { 
            const type = holding.security_type === 'company' ? 'Stocks' : 'Mutual Funds';
            const price = holding.current_price || holding.nav || 0;
            acc[type] = (acc[type] || 0) + (holding.quantity * price);
            return acc;
        }, {});
        
        const labels = [];
        const data = [];
        
        // Add Cash
        if (cashHeld > 0) {
            labels.push('Cash');
            data.push(cashHeld);
        }
        
        // Add Stocks
        if (allocationByType['Stocks'] > 0) {
            labels.push('Stocks');
            data.push(allocationByType['Stocks']);
        }
        
        // Add Mutual Funds
        if (allocationByType['Mutual Funds'] > 0) {
            labels.push('Mutual Funds');
            data.push(allocationByType['Mutual Funds']);
        }
        
        return {
            labels: labels,
            data: data
        };

    }, [calculatedMetrics]);


    return {
        portfolioData: portfolioData,
        isLoading,
        ...calculatedMetrics,
        chartAllocationData,
    };
};
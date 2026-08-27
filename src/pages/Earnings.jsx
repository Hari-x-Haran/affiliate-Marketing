import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLinks } from '../context/LinkContext';
import StatCard from '../components/StatCard';

export const Earnings = () => {
  const { links, addClick } = useLinks();
  const navigate = useNavigate();
  const [nowTime] = useState(() => Date.now());

  // Helper: Calculate deterministic conversions, order values, and commission for a link
  const calculateLinkMetrics = (link) => {
    const clicks = link.clicks || 0;
    const isFlipkart = link.originalUrl.toLowerCase().includes('flipkart');
    const programName = isFlipkart ? 'Flipkart' : 'Amazon';
    const commissionRate = isFlipkart ? 0.07 : 0.085; // 7% for Flipkart, 8.5% for Amazon
    const baseOrderValue = isFlipkart ? 1500 : 1200;   // Base values in INR
    const conversionRate = isFlipkart ? 0.06 : 0.08;   // Conversion probability per click

    if (clicks === 0) {
      return {
        conversions: 0,
        earnings: 0,
        avgOrderValue: 0,
        programName,
        commissionRate,
        clicks
      };
    }

    // Deterministic hash based on link ID to keep values stable on reload
    let hash = 0;
    for (let i = 0; i < link.id.length; i++) {
      hash = link.id.charCodeAt(i) + ((hash << 5) - hash);
    }

    let conversions = 0;
    let totalEarnings = 0;
    let orderValuesSum = 0;

    for (let c = 1; c <= clicks; c++) {
      const conversionVal = Math.abs(Math.sin(hash + c) * 1000) % 1;
      if (conversionVal < conversionRate) {
        conversions++;
        const orderValMultiplier = 0.7 + (Math.abs(Math.cos(hash + c) * 1000) % 0.9); // 0.7x to 1.6x multiplier
        const orderValue = baseOrderValue * orderValMultiplier;
        orderValuesSum += orderValue;
        totalEarnings += orderValue * commissionRate;
      }
    }

    return {
      conversions,
      earnings: parseFloat(totalEarnings.toFixed(2)),
      avgOrderValue: conversions > 0 ? parseFloat((orderValuesSum / conversions).toFixed(2)) : 0,
      programName,
      commissionRate,
      clicks
    };
  };

  // 1. Process all links and calculate individual metrics
  const processedLinks = useMemo(() => {
    return links.map(link => ({
      ...link,
      metrics: calculateLinkMetrics(link)
    }));
  }, [links]);

  // 2. Aggregate metrics globally and by program
  const aggregates = useMemo(() => {
    let totalEarnings = 0;
    let totalConversions = 0;
    let totalClicks = 0;

    const programData = {
      Amazon: { clicks: 0, conversions: 0, earnings: 0, linkCount: 0, rate: 8.5 },
      Flipkart: { clicks: 0, conversions: 0, earnings: 0, linkCount: 0, rate: 7.0 }
    };

    processedLinks.forEach(link => {
      const { clicks, conversions, earnings, programName } = link.metrics;

      totalClicks += clicks;
      totalConversions += conversions;
      totalEarnings += earnings;

      if (programData[programName]) {
        programData[programName].clicks += clicks;
        programData[programName].conversions += conversions;
        programData[programName].earnings += earnings;
        programData[programName].linkCount += 1;
      }
    });

    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    const epc = totalClicks > 0 ? totalEarnings / totalClicks : 0;

    return {
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      totalConversions,
      totalClicks,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      epc: parseFloat(epc.toFixed(2)),
      programData
    };
  }, [processedLinks]);

  // 3. Generate detailed transaction list for ledger display
  const transactions = useMemo(() => {
    const txnList = [];

    links.forEach(link => {
      const clicks = link.clicks || 0;
      if (clicks === 0) return;

      const isFlipkart = link.originalUrl.toLowerCase().includes('flipkart');
      const programName = isFlipkart ? 'Flipkart' : 'Amazon';
      const commissionRate = isFlipkart ? 0.07 : 0.085;
      const baseOrderValue = isFlipkart ? 1500 : 1200;
      const conversionRate = isFlipkart ? 0.06 : 0.08;

      let hash = 0;
      for (let i = 0; i < link.id.length; i++) {
        hash = link.id.charCodeAt(i) + ((hash << 5) - hash);
      }

      const linkTime = new Date(link.createdAt).getTime();
      const timeDelta = Math.max(nowTime - linkTime, 60000); // at least 1 min

      for (let c = 1; c <= clicks; c++) {
        const conversionVal = Math.abs(Math.sin(hash + c) * 1000) % 1;
        if (conversionVal < conversionRate) {
          const orderValMultiplier = 0.7 + (Math.abs(Math.cos(hash + c) * 1000) % 0.9);
          const orderValue = baseOrderValue * orderValMultiplier;
          const commission = orderValue * commissionRate;
          
          // Spread conversion timestamps dynamically between created time and now
          const progress = c / clicks;
          const txnTimestamp = linkTime + (timeDelta * progress);
          
          txnList.push({
            id: `TXN-${link.id.toUpperCase()}-${c}`,
            linkId: link.id,
            shortUrl: link.shortUrl,
            originalUrl: link.originalUrl,
            program: programName,
            orderValue: parseFloat(orderValue.toFixed(2)),
            commission: parseFloat(commission.toFixed(2)),
            timestamp: new Date(txnTimestamp).toISOString()
          });
        }
      }
    });

    // Sort by timestamp descending
    return txnList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [links, nowTime]);

  // Helper to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Helper to format date
  const formatDateTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  if (links.length === 0) {
    return (
      <div className="earnings-page">
        <div className="earnings-page__header">
          <h1 className="page-title">Affiliate Earnings</h1>
          <p className="page-subtitle">Track conversions, orders, and commission payouts</p>
        </div>

        <div className="empty-state section-card">
          <div className="empty-state__icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <h3>No earnings data available</h3>
          <p>
            Create affiliate links and simulate visitor clicks to begin generating sales conversions and tracking commissions.
          </p>
          <button
            onClick={() => navigate('/create-link')}
            className="btn-primary"
            style={{ marginTop: '1.25rem' }}
          >
            Create Affiliate Link
          </button>
        </div>
      </div>
    );
  }

  // Earnings Share for chart
  const amazonShare = aggregates.totalEarnings > 0 
    ? (aggregates.programData.Amazon.earnings / aggregates.totalEarnings) * 100 
    : 0;
  const flipkartShare = aggregates.totalEarnings > 0 
    ? (aggregates.programData.Flipkart.earnings / aggregates.totalEarnings) * 100 
    : 0;

  return (
    <div className="earnings-page">
      <div className="earnings-page__header">
        <div>
          <h1 className="page-title">Affiliate Earnings</h1>
          <p className="page-subtitle">Monitor commission distribution and tracking simulated order conversions</p>
        </div>
      </div>

      {/* Global Earnings Stats */}
      <div className="stats-grid">
        <StatCard
          title="Total Earnings"
          value={formatCurrency(aggregates.totalEarnings)}
          description="Accumulated commissions"
        />
        <StatCard
          title="Total Conversions"
          value={aggregates.totalConversions}
          description="Successful sales orders"
        />
        <StatCard
          title="Conversion Rate"
          value={`${aggregates.conversionRate}%`}
          description="Conversions per click"
        />
        <StatCard
          title="Earnings Per Click"
          value={formatCurrency(aggregates.epc)}
          description="Average yield per click"
        />
      </div>

      <div className="earnings-grid">
        {/* Left column: Program breakdown & Ledgers */}
        <div className="earnings-grid__main">
          {/* Affiliate Program Breakdown Cards */}
          <div className="section-card">
            <div className="section-card__header">
              <h2>Program Distribution</h2>
            </div>
            
            <div className="program-breakdown">
              {/* Amazon */}
              <div className="program-card program-card--amazon">
                <div className="program-card__header">
                  <span className="badge badge--amazon">Amazon Affiliate</span>
                  <span className="program-card__earnings">
                    {formatCurrency(aggregates.programData.Amazon.earnings)}
                  </span>
                </div>
                <div className="program-card__stats">
                  <div className="program-card__stat">
                    <span className="label">Links</span>
                    <span className="value">{aggregates.programData.Amazon.linkCount}</span>
                  </div>
                  <div className="program-card__stat">
                    <span className="label">Clicks</span>
                    <span className="value">{aggregates.programData.Amazon.clicks}</span>
                  </div>
                  <div className="program-card__stat">
                    <span className="label">Conversions</span>
                    <span className="value">{aggregates.programData.Amazon.conversions}</span>
                  </div>
                  <div className="program-card__stat">
                    <span className="label">Rate</span>
                    <span className="value">{aggregates.programData.Amazon.rate}%</span>
                  </div>
                </div>
              </div>

              {/* Flipkart */}
              <div className="program-card program-card--flipkart">
                <div className="program-card__header">
                  <span className="badge badge--flipkart">Flipkart Affiliate</span>
                  <span className="program-card__earnings">
                    {formatCurrency(aggregates.programData.Flipkart.earnings)}
                  </span>
                </div>
                <div className="program-card__stats">
                  <div className="program-card__stat">
                    <span className="label">Links</span>
                    <span className="value">{aggregates.programData.Flipkart.linkCount}</span>
                  </div>
                  <div className="program-card__stat">
                    <span className="label">Clicks</span>
                    <span className="value">{aggregates.programData.Flipkart.clicks}</span>
                  </div>
                  <div className="program-card__stat">
                    <span className="label">Conversions</span>
                    <span className="value">{aggregates.programData.Flipkart.conversions}</span>
                  </div>
                  <div className="program-card__stat">
                    <span className="label">Rate</span>
                    <span className="value">{aggregates.programData.Flipkart.rate}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Split Visual Indicator */}
            {aggregates.totalEarnings > 0 && (
              <div className="earnings-split">
                <div className="earnings-split__bar">
                  <div 
                    className="earnings-split__fill earnings-split__fill--amazon" 
                    style={{ width: `${amazonShare}%` }}
                    title={`Amazon: ${amazonShare.toFixed(1)}%`}
                  />
                  <div 
                    className="earnings-split__fill earnings-split__fill--flipkart" 
                    style={{ width: `${flipkartShare}%` }}
                    title={`Flipkart: ${flipkartShare.toFixed(1)}%`}
                  />
                </div>
                <div className="earnings-split__labels">
                  <span className="legend-label legend-label--amazon">Amazon ({amazonShare.toFixed(1)}%)</span>
                  <span className="legend-label legend-label--flipkart">Flipkart ({flipkartShare.toFixed(1)}%)</span>
                </div>
              </div>
            )}
          </div>

          {/* Links Earnings Ledger */}
          <div className="section-card" style={{ marginTop: '2rem' }}>
            <div className="section-card__header">
              <h2>Link Performance & Earnings</h2>
            </div>
            
            <div className="table-wrapper">
              <table className="earnings-table">
                <thead>
                  <tr>
                    <th>Short Link</th>
                    <th>Program</th>
                    <th>Clicks</th>
                    <th>Conversions</th>
                    <th>Commission Rate</th>
                    <th>Total Earnings</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {processedLinks.map(link => {
                    const isAmazon = link.metrics.programName === 'Amazon';
                    return (
                      <tr key={link.id}>
                        <td>
                          <a 
                            href={link.originalUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="table-link"
                          >
                            short.ly/{link.id}
                          </a>
                        </td>
                        <td>
                          <span className={`badge badge--compact ${isAmazon ? 'badge--amazon' : 'badge--flipkart'}`}>
                            {link.metrics.programName}
                          </span>
                        </td>
                        <td>{link.clicks}</td>
                        <td>{link.metrics.conversions}</td>
                        <td>{(link.metrics.commissionRate * 100).toFixed(1)}%</td>
                        <td className="earnings-cell">{formatCurrency(link.metrics.earnings)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn-simulate btn-simulate--compact"
                            onClick={() => addClick(link.id)}
                            title="Simulate Click"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                              <polyline points="16 7 22 7 22 13" />
                            </svg>
                            Click
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column: Recent Transactions ledger */}
        <div className="earnings-grid__side">
          <div className="section-card history-card">
            <div className="section-card__header">
              <h2>Recent Conversions</h2>
              <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                Timeline of simulated order payout notifications
              </p>
            </div>

            {transactions.length > 0 ? (
              <div className="transaction-timeline">
                {transactions.slice(0, 10).map(txn => (
                  <div key={txn.id} className="transaction-item fade-in">
                    <div className="transaction-item__dot" />
                    <div className="transaction-item__content">
                      <div className="transaction-item__header">
                        <span className="transaction-item__id">{txn.id}</span>
                        <span className="transaction-item__amt">
                          +{formatCurrency(txn.commission)}
                        </span>
                      </div>
                      <div className="transaction-item__details">
                        <span className={`badge badge--compact ${txn.program === 'Amazon' ? 'badge--amazon' : 'badge--flipkart'}`}>
                          {txn.program}
                        </span>
                        <span className="transaction-item__val">
                          Order Val: {formatCurrency(txn.orderValue)}
                        </span>
                      </div>
                      <div className="transaction-item__meta">
                        <span className="transaction-item__link">short.ly/{txn.linkId}</span>
                        <span className="transaction-item__time">{formatDateTime(txn.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {transactions.length > 10 && (
                  <p className="timeline-footer">Showing last 10 conversions</p>
                )}
              </div>
            ) : (
              <div className="timeline-empty">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <p>Waiting for sales conversions to register...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;

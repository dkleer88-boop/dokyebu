import React, { useState, useEffect } from 'react';

interface Transaction {
  id: number;
  date: string; // YYYY-MM-DD
  siteName: string;
  type: 'deposit' | 'withdrawal'; // deposit: 지출(충전), withdrawal: 수입(환전)
  amount: number;
  currency: '₩' | '$';
  pinCode: string;
}

const PRESET_COLORS = ['#ff7675', '#fdcb6e', '#55efc4', '#74b9ff', '#a29bfe', '#fab1a0', '#00cec9', '#e84393', '#ffeaa7', '#dfe6e9', '#ff5252', '#3b82f6'];

function App() {
  const [bottomTab, setBottomTab] = useState<number>(1);
  const [calendarSubTab, setCalendarSubTab] = useState<'calendar' | 'weekly'>('calendar');
  const [summarySubTab, setSummarySubTab] = useState<'weeklyList' | 'monthly'>('weeklyList');
  const [statSubTab, setStatSubTab] = useState<'withdrawal' | 'deposit'>('withdrawal');
  const [settingView, setSettingView] = useState<'main' | 'siteManager'>('main');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1));
  
  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('dogbyebu_transactions');
    return saved ? JSON.parse(saved) : [
      { id: 1, date: '2026-09-26', siteName: '미우', type: 'withdrawal', amount: 15000000, currency: '₩', pinCode: '' },
      { id: 2, date: '2026-09-26', siteName: '미우', type: 'deposit', amount: 127000000, currency: '₩', pinCode: '' },
      { id: 3, date: '2026-09-22', siteName: '아벤', type: 'withdrawal', amount: 500, currency: '$', pinCode: '' },
      { id: 4, date: '2026-09-22', siteName: '아벤', type: 'deposit', amount: 300, currency: '$', pinCode: '' },
      { id: 5, date: '2026-09-22', siteName: '미우', type: 'withdrawal', amount: 1400000, currency: '₩', pinCode: '' },
      { id: 6, date: '2026-09-22', siteName: '아벤', type: 'deposit', amount: 9999999, currency: '₩', pinCode: '' },
    ];
  });

  const [sites, setSites] = useState<{ name: string; color: string }[]>(() => {
    const saved = localStorage.getItem('dogbyebu_sites_v2');
    if (saved) return JSON.parse(saved);
    const oldSaved = localStorage.getItem('dogbyebu_sites');
    const defaultNames = oldSaved ? JSON.parse(oldSaved) : ['미우', '아벤', '80bet', '9win', '소울'];
    return defaultNames.map((name: string, idx: number) => ({
      name,
      color: PRESET_COLORS[idx % PRESET_COLORS.length]
    }));
  });

  const [editingSiteIndex, setEditingSiteIndex] = useState<number | null>(null);
  const [editingSiteNameInput, setEditingSiteNameInput] = useState<string>('');
  const [editingSiteColorInput, setEditingSiteColorInput] = useState<string>('#ff7675');

  useEffect(() => {
    localStorage.setItem('dogbyebu_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('dogbyebu_sites_v2', JSON.stringify(sites));
  }, [sites]);
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalStep, setModalStep] = useState<number>(1);
  const [amountInput, setAmountInput] = useState<string>('0');
  const [currency, setCurrency] = useState<'₩' | '$'>('₩');
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState<boolean>(false);
  const [txType, setTxType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [modalNewSiteInput, setModalNewSiteInput] = useState<string>('');
  const [modalNewSiteColor, setModalNewSiteColor] = useState<string>('#ff7675');

  const [newSiteNameInput, setNewSiteNameInput] = useState<string>('');
  const [newSiteColorInput, setNewSiteColorInput] = useState<string>('#ff7675');

  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editAmountInput, setEditAmountInput] = useState<string>('');
  const [editCurrency, setEditCurrency] = useState<'₩' | '$'>('₩');
  const [editTxType, setEditTxType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [editSiteName, setEditSiteName] = useState<string>('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const firstDayOfMonth = (firstDayIndex === 0 ? 6 : firstDayIndex - 1);
  const lastDateOfMonth = new Date(year, month + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= lastDateOfMonth; i++) days.push(i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthlyTxs = transactions.filter(tx => tx.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`));

  const getSiteColor = (siteName: string) => {
    const found = sites.find(s => s.name === siteName);
    return found ? found.color : '#777777';
  };

  const getWeeksOfMonth = (y: number, m: number) => {
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);
    
    let weeks = [];
    let currentStart = new Date(firstDay);
    
    const dayOfWeek = currentStart.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    currentStart.setDate(currentStart.getDate() + diffToMonday);

    let weekNum = 1;
    while (currentStart <= lastDay) {
      let currentEnd = new Date(currentStart);
      currentEnd.setDate(currentStart.getDate() + 6);

      const startMonth = currentStart.getMonth() + 1;
      const startDay = currentStart.getDate();
      const endMonth = currentEnd.getMonth() + 1;
      const endDay = currentEnd.getDate();

      weeks.push({
        weekNum,
        startStr: currentStart.toISOString().split('T')[0],
        endStr: currentEnd.toISOString().split('T')[0],
        label: `${startMonth}/${startDay} ~ ${endMonth}/${endDay}`
      });

      currentStart.setDate(currentStart.getDate() + 7);
      weekNum++;
    }
    return weeks;
  };

  const monthWeeks = getWeeksOfMonth(year, month);

  const handleOpenAddModal = () => {
    if (!selectedDate) {
      setSelectedDate(getTodayStr());
    }
    setAmountInput('0');
    setModalStep(1);
    setIsModalOpen(true);
  };

  const handleKeypadPress = (val: string) => {
    if (amountInput === '0') {
      setAmountInput(val);
    } else {
      setAmountInput(amountInput + val);
    }
  };

  const handleKeypadDelete = () => {
    if (amountInput.length <= 1) {
      setAmountInput('0');
    } else {
      setAmountInput(amountInput.slice(0, -1));
    }
  };

  const handleCompleteTransaction = (siteName: string) => {
    const numAmount = Number(amountInput);
    if (numAmount <= 0) return;
    const targetDate = selectedDate || getTodayStr();
    const newTx: Transaction = {
      id: Date.now(),
      date: targetDate,
      siteName,
      type: txType,
      amount: numAmount,
      currency,
      pinCode: '',
    };
    setTransactions([...transactions, newTx]);
    setIsModalOpen(false);
    setModalStep(1);
  };

  const handleOpenEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setEditAmountInput(String(tx.amount));
    setEditCurrency(tx.currency);
    setEditTxType(tx.type);
    setEditSiteName(tx.siteName);
  };

  const handleUpdateTransaction = () => {
    if (!editingTx) return;
    const numAmount = Number(editAmountInput);
    if (numAmount <= 0) return;
    setTransactions(transactions.map(tx => tx.id === editingTx.id ? { ...tx, amount: numAmount, currency: editCurrency, type: editTxType, siteName: editSiteName } : tx));
    setEditingTx(null);
  };

  const handleDeleteTransaction = (id: number) => {
    setTransactions(transactions.filter(tx => tx.id !== id));
    setEditingTx(null);
  };

  const handleUpdateSite = (oldName: string, newName: string, newColor: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (sites.some(s => s.name === trimmed && s.name !== oldName)) return;
    
    setSites(sites.map(s => (s.name === oldName ? { name: trimmed, color: newColor } : s)));
    if (oldName !== trimmed) {
      setTransactions(transactions.map(tx => (tx.siteName === oldName ? { ...tx, siteName: trimmed } : tx)));
    }
    setEditingSiteIndex(null);
  };

  const bgMain = isDarkMode ? '#121212' : '#f4f6f8';
  const bgCard = isDarkMode ? '#1a1a1a' : '#ffffff';
  const textMain = isDarkMode ? '#f8fafc' : '#1e293b';
  const textSub = isDarkMode ? '#888' : '#64748b';
  const borderCol = isDarkMode ? '#2a2a2a' : '#e2e8f0';

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', width: '100vw', height: '100vh', maxWidth: '480px', margin: '0 auto', background: bgMain, color: textMain, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', position: 'relative', overflow: 'hidden', paddingTop: 'max(env(safe-area-inset-top), 8px)', paddingBottom: 'calc(105px + env(safe-area-inset-top))' }}>
      
      {/* 상단 헤더 영역 (노치 여백 대응 반영) */}
      <div style={{ padding: '8px 16px', borderBottom: `1px solid ${borderCol}`, flexShrink: 0, background: bgMain }}>
        {bottomTab === 1 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div>
                <span style={{ fontSize: '11px', color: textSub }}>수입</span>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#34d399' }}>
                  {(['₩', '$'] as const).map(cur => {
                    const sum = monthlyTxs.filter(tx => tx.type === 'withdrawal' && tx.currency === cur).reduce((a, b) => a + b.amount, 0);
                    if (sum === 0 && cur === '$') return null;
                    return <div key={cur}>{cur === '$' ? `$${sum.toLocaleString()}` : sum.toLocaleString()}</div>;
                  })}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: textSub }}>지출</span>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#f87171' }}>
                  {(['₩', '$'] as const).map(cur => {
                    const sum = monthlyTxs.filter(tx => tx.type === 'deposit' && tx.currency === cur).reduce((a, b) => a + b.amount, 0);
                    if (sum === 0 && cur === '$') return null;
                    return <div key={cur}>{cur === '$' ? `$${sum.toLocaleString()}` : sum.toLocaleString()}</div>;
                  })}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: textSub }}>수입-지출</span>
                <div style={{ fontSize: '13px', fontWeight: '800' }}>
                  {(['₩', '$'] as const).map(cur => {
                    const dep = monthlyTxs.filter(tx => tx.type === 'deposit' && tx.currency === cur).reduce((a, b) => a + b.amount, 0);
                    const wit = monthlyTxs.filter(tx => tx.type === 'withdrawal' && tx.currency === cur).reduce((a, b) => a + b.amount, 0);
                    const bal = wit - dep;
                    if (dep === 0 && wit === 0) return null;
                    const formattedVal = cur === '$' ? `${bal >= 0 ? '+' : '-'}$${Math.abs(bal).toLocaleString()}` : `${bal >= 0 ? '+' : ''}${bal.toLocaleString()}`;
                    return <div key={cur} style={{ color: bal >= 0 ? '#34d399' : '#f87171' }}>{formattedVal}</div>;
                  })}
                  {monthlyTxs.length === 0 && <span style={{ color: textSub }}>0</span>}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '13px', fontWeight: '600', borderTop: `1px solid ${borderCol}`, paddingTop: '6px' }}>
              <span onClick={() => setCalendarSubTab('calendar')} style={{ color: calendarSubTab === 'calendar' ? textMain : textSub, cursor: 'pointer', borderBottom: calendarSubTab === 'calendar' ? '2px solid #ff5252' : 'none', paddingBottom: '2px' }}>달력</span>
              <span onClick={() => setCalendarSubTab('weekly')} style={{ color: calendarSubTab === 'weekly' ? textMain : textSub, cursor: 'pointer', borderBottom: calendarSubTab === 'weekly' ? '2px solid #ff5252' : 'none', paddingBottom: '2px' }}>주간</span>
            </div>
          </div>
        )}

        {bottomTab === 2 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '13px', fontWeight: '600' }}>
            <span onClick={() => setSummarySubTab('weeklyList')} style={{ color: summarySubTab === 'weeklyList' ? textMain : textSub, cursor: 'pointer', borderBottom: summarySubTab === 'weeklyList' ? '2px solid #ff5252' : 'none', paddingBottom: '2px' }}>주차별 상세</span>
            <span onClick={() => setSummarySubTab('monthly')} style={{ color: summarySubTab === 'monthly' ? textMain : textSub, cursor: 'pointer', borderBottom: summarySubTab === 'monthly' ? '2px solid #ff5252' : 'none', paddingBottom: '2px' }}>월간 손익</span>
          </div>
        )}
        {bottomTab === 3 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '13px', fontWeight: '600' }}>
            <span onClick={() => setStatSubTab('withdrawal')} style={{ color: statSubTab === 'withdrawal' ? textMain : textSub, cursor: 'pointer', borderBottom: statSubTab === 'withdrawal' ? '2px solid #ff5252' : 'none', paddingBottom: '2px' }}>환전 통계</span>
            <span onClick={() => setStatSubTab('deposit')} style={{ color: statSubTab === 'deposit' ? textMain : textSub, cursor: 'pointer', borderBottom: statSubTab === 'deposit' ? '2px solid #ff5252' : 'none', paddingBottom: '2px' }}>충전 통계</span>
          </div>
        )}
        {bottomTab === 4 && <div style={{ fontSize: '14px', fontWeight: '700', textAlign: 'center' }}>자산 / 총괄</div>}
        {bottomTab === 5 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: settingView === 'siteManager' ? 'space-between' : 'center' }}>
            {settingView === 'siteManager' && (
              <span onClick={() => setSettingView('main')} style={{ fontSize: '12px', cursor: 'pointer', color: textSub }}>〈 이전</span>
            )}
            <div style={{ fontSize: '14px', fontWeight: '700', textAlign: 'center', flex: settingView === 'siteManager' ? 1 : undefined }}>
              {settingView === 'main' ? '설정' : '사이트 추가 및 관리'}
            </div>
            {settingView === 'siteManager' && <div style={{ width: '30px' }}></div>}
          </div>
        )}
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div style={{ flex: 1, padding: '8px 12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* [탭 1] 달력 모드 */}
        {bottomTab === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {calendarSubTab === 'calendar' ? (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexShrink: 0, padding: '0 4px' }}>
                  <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: textMain, fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', padding: '4px 8px' }}>〈</button>
                  <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '800', letterSpacing: '0.5px' }}>{year}년 {month + 1}월</h2>
                  <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: textMain, fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', padding: '4px 8px' }}>〉</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: '600', marginBottom: '4px', color: textSub, fontSize: '11px', flexShrink: 0 }}>
                  <div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div style={{ color: '#60a5fa' }}>토</div><div style={{ color: '#ff6b6b' }}>일</div>
                </div>

                {/* 달력 세로 높이 최적화 */}
                <div style={{ display: 'grid', gridTemplateRows: 'repeat(5, 1fr)', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', background: borderCol, border: `1px solid ${borderCol}`, borderRadius: '6px', flexShrink: 0, height: '370px', overflow: 'hidden' }}>
                  {days.map((day, index) => {
                    const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                    const dayTxs = transactions.filter(tx => tx.date === dateStr);

                    const sumsByCurrency: { [cur: string]: { deposit: number; withdrawal: number } } = {};
                    dayTxs.forEach(tx => {
                      if (!sumsByCurrency[tx.currency]) sumsByCurrency[tx.currency] = { deposit: 0, withdrawal: 0 };
                      if (tx.type === 'deposit') sumsByCurrency[tx.currency].deposit += tx.amount;
                      else sumsByCurrency[tx.currency].withdrawal += tx.amount;
                    });

                    let maxLen = 0;
                    Object.entries(sumsByCurrency).forEach(([cur, val]) => {
                      if (val.withdrawal > 0) maxLen = Math.max(maxLen, val.withdrawal.toLocaleString().length);
                      if (val.deposit > 0) maxLen = Math.max(maxLen, val.deposit.toLocaleString().length);
                    });

                    let dynamicFontSize = '11.5px';
                    let dynamicLetterSpacing = '-0.3px';
                    if (maxLen >= 10) {
                      dynamicFontSize = '9px';
                      dynamicLetterSpacing = '-0.8px';
                    } else if (maxLen >= 8) {
                      dynamicFontSize = '10px';
                      dynamicLetterSpacing = '-0.6px';
                    } else if (maxLen >= 6) {
                      dynamicFontSize = '10.5px';
                      dynamicLetterSpacing = '-0.4px';
                    }

                    return (
                      <div 
                        key={index} 
                        onClick={() => day && setSelectedDate(dateStr)}
                        style={{ 
                          background: selectedDate === dateStr ? (isDarkMode ? '#222' : '#e2e8f0') : bgCard, 
                          border: selectedDate === dateStr ? '1px solid #ff5252' : `1px solid ${borderCol}`, 
                          padding: '3px 2px', 
                          cursor: day ? 'pointer' : 'default',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          overflow: 'hidden',
                          height: '100%',
                          boxSizing: 'border-box'
                        }}
                      >
                        <div style={{ textAlign: 'right', fontSize: '10px', color: day ? textMain : '#555', fontWeight: '700', flexShrink: 0 }}>{day}</div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5px', overflow: 'hidden', flex: 1, justifyContent: 'center', alignItems: 'flex-end', textAlign: 'right' }}>
                          {Object.entries(sumsByCurrency).map(([cur, val]) => (
                            <React.Fragment key={cur}>
                              {val.withdrawal > 0 && (
                                <div style={{ color: '#34d399', whiteSpace: 'nowrap', fontWeight: 'normal', fontSize: cur === '$' ? '11px' : dynamicFontSize, letterSpacing: cur === '$' ? '-0.3px' : dynamicLetterSpacing, lineHeight: '1.1' }}>
                                  {cur === '$' ? `$${val.withdrawal.toLocaleString()}` : val.withdrawal.toLocaleString()}
                                </div>
                              )}
                              {val.deposit > 0 && (
                                <div style={{ color: '#f87171', whiteSpace: 'nowrap', fontWeight: 'normal', fontSize: cur === '$' ? '11px' : dynamicFontSize, letterSpacing: cur === '$' ? '-0.3px' : dynamicLetterSpacing, lineHeight: '1.1' }}>
                                  -{cur === '$' ? `$${val.deposit.toLocaleString()}` : val.deposit.toLocaleString()}
                                </div>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 달력 하단 선택 날짜 상세 영역 (달력과 완벽히 분리) */}
                <div style={{ marginTop: '12px', background: bgCard, padding: '10px 12px', borderRadius: '8px', border: `1px solid ${borderCol}`, flex: 1, overflowY: 'auto', boxSizing: 'border-box' }}>
                  {(() => {
                    const targetTxs = transactions.filter(tx => tx.date === selectedDate);
                    
                    const depSummary: { [cur: string]: number } = {};
                    const witSummary: { [cur: string]: number } = {};
                    targetTxs.forEach(tx => {
                      if (tx.type === 'deposit') depSummary[tx.currency] = (depSummary[tx.currency] || 0) + tx.amount;
                      if (tx.type === 'withdrawal') witSummary[tx.currency] = (witSummary[tx.currency] || 0) + tx.amount;
                    });

                    return (
                      <div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px', borderBottom: `1px solid ${borderCol}`, paddingBottom: '6px' }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: textMain }}>
                            {selectedDate}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                            <div>
                              <span style={{ color: '#34d399', fontWeight: 'bold' }}>
                                수입 {(['₩', '$'] as const).map(cur => witSummary[cur] ? `${cur === '$' ? '$' : ''}${witSummary[cur].toLocaleString()}` : '').filter(Boolean).join(' / ') || '0'}
                              </span>
                              <span style={{ color: '#f87171', fontWeight: 'bold', marginLeft: '8px' }}>
                                지출 {(['₩', '$'] as const).map(cur => depSummary[cur] ? `${cur === '$' ? '$' : ''}${depSummary[cur].toLocaleString()}` : '').filter(Boolean).join(' / ') || '0'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {targetTxs.length === 0 ? (
                          <div style={{ fontSize: '11px', color: textSub, textAlign: 'center', padding: '10px 0' }}>선택한 날짜에 내역이 없습니다.</div>
                        ) : (
                          targetTxs.map(tx => (
                            <div 
                              key={tx.id} 
                              onClick={() => handleOpenEditModal(tx)}
                              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${borderCol}`, cursor: 'pointer' }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: getSiteColor(tx.siteName), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold', color: '#000' }}>
                                  {tx.siteName.slice(0, 2)}
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{tx.siteName}</span>
                              </div>
                              <span style={{ fontSize: '12px', fontWeight: 'bold', color: tx.type === 'deposit' ? '#f87171' : '#34d399' }}>
                                {tx.type === 'deposit' ? '-' : '+'}{tx.currency === '$' ? `$${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>월요일 기준 주차별 손익 요약</div>
                {monthWeeks.map((week) => {
                  const weekTxs = transactions.filter(tx => tx.date >= week.startStr && tx.date <= week.endStr);
                  
                  return (
                    <div key={week.weekNum} style={{ background: bgCard, padding: '14px', borderRadius: '10px', border: `1px solid ${borderCol}`, marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ff5252' }}>{week.weekNum}주차 ({week.label})</div>
                        <div style={{ fontSize: '11px', color: textSub, marginTop: '2px' }}>
                          내역 총 {weekTxs.length}건
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '800', textAlign: 'right' }}>
                        {(['₩', '$'] as const).map(cur => {
                          const wDep = weekTxs.filter(tx => tx.type === 'deposit' && tx.currency === cur).reduce((a, b) => a + b.amount, 0);
                          const wWit = weekTxs.filter(tx => tx.type === 'withdrawal' && tx.currency === cur).reduce((a, b) => a + b.amount, 0);
                          const wNet = wWit - wDep;
                          if (wDep === 0 && wWit === 0) return null;
                          return (
                            <div key={cur} style={{ color: wNet >= 0 ? '#34d399' : '#f87171' }}>
                              {wNet >= 0 ? '+' : '-'}{cur === '$' ? `$${Math.abs(wNet).toLocaleString()}` : Math.abs(wNet).toLocaleString()}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* [탭 2] 상세 모드 */}
        {bottomTab === 2 && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {summarySubTab === 'weeklyList' ? (
              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>주차별 상세 손익 및 사이트별 내역</div>
                {monthWeeks.map((week) => {
                  const weekTxs = transactions.filter(tx => tx.date >= week.startStr && tx.date <= week.endStr);

                  return (
                    <div key={week.weekNum} style={{ background: bgCard, padding: '12px', borderRadius: '10px', border: `1px solid ${borderCol}`, marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${borderCol}`, paddingBottom: '6px', marginBottom: '8px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ff5252' }}>{week.weekNum}주차 ({week.label})</div>
                      </div>

                      {sites.map((siteObj, sIdx) => {
                        const siteWeekTxs = weekTxs.filter(tx => tx.siteName === siteObj.name);
                        if (siteWeekTxs.length === 0) return null;

                        return (
                          <div key={sIdx} style={{ background: isDarkMode ? '#161616' : '#f8fafc', padding: '8px 10px', borderRadius: '8px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{siteObj.name}</div>
                            <div style={{ textAlign: 'right' }}>
                              {(['₩', '$'] as const).map(cur => {
                                const sDep = siteWeekTxs.filter(tx => tx.type === 'deposit' && tx.currency === cur).reduce((a, b) => a + b.amount, 0);
                                const sWit = siteWeekTxs.filter(tx => tx.type === 'withdrawal' && tx.currency === cur).reduce((a, b) => a + b.amount, 0);
                                const sNet = sWit - sDep;
                                if (sDep === 0 && sWit === 0) return null;
                                return (
                                  <div key={cur} style={{ fontSize: '12px', fontWeight: 'bold', color: sNet >= 0 ? '#34d399' : '#f87171' }}>
                                    {sNet >= 0 ? '+' : '-'}{cur === '$' ? `$${Math.abs(sNet).toLocaleString()}` : Math.abs(sNet).toLocaleString()}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                      {weekTxs.length === 0 && <div style={{ fontSize: '11px', color: textSub, textAlign: 'center' }}>내역 없음</div>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                <div style={{ background: bgCard, padding: '12px', borderRadius: '10px', border: `1px solid ${borderCol}`, marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', color: textSub }}>이번 달 총 손익</div>
                  <div style={{ margin: '6px 0', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {(['₩', '$'] as const).map(cur => {
                      const dep = monthlyTxs.filter(tx => tx.type === 'deposit' && tx.currency === cur).reduce((a, b) => a + b.amount, 0);
                      const wit = monthlyTxs.filter(tx => tx.type === 'withdrawal' && tx.currency === cur).reduce((a, b) => a + b.amount, 0);
                      const bal = wit - dep;
                      if (dep === 0 && wit === 0) return null;
                      return (
                        <div key={cur}>
                          <span style={{ fontSize: '10px', color: textSub }}>{cur} 손익: </span>
                          <span style={{ fontSize: '13px', fontWeight: '800', color: bal >= 0 ? '#34d399' : '#ff5252' }}>
                            {bal >= 0 ? '+' : '-'}{cur === '$' ? `$${Math.abs(bal).toLocaleString()}` : Math.abs(bal).toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>사이트별 상세 손익</div>
                {sites.map((siteObj, idx) => {
                  const siteTxs = monthlyTxs.filter(tx => tx.siteName === siteObj.name);
                  
                  const siteSummary = (['₩', '$'] as const).map(cur => {
                    const dep = siteTxs.filter(tx => tx.type === 'deposit' && tx.currency === cur).reduce((a, b) => a + b.amount, 0);
                    const wit = siteTxs.filter(tx => tx.type === 'withdrawal' && tx.currency === cur).reduce((a, b) => a + b.amount, 0);
                    const net = wit - dep;
                    return { cur, dep, wit, net };
                  }).filter(item => item.dep > 0 || item.wit > 0);

                  return (
                    <div key={idx} style={{ background: bgCard, padding: '10px', borderRadius: '8px', border: `1px solid ${borderCol}`, marginBottom: '6px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '2px' }}>{siteObj.name}</div>
                      {siteSummary.length === 0 ? (
                        <div style={{ fontSize: '10px', color: textSub }}>내역 없음</div>
                      ) : (
                        siteSummary.map(s => (
                          <div key={s.cur} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', marginTop: '4px' }}>
                            <span style={{ color: textSub }}>지출 {s.cur === '$' ? `$${s.dep.toLocaleString()}` : s.dep.toLocaleString()} / 수입 {s.cur === '$' ? `$${s.wit.toLocaleString()}` : s.wit.toLocaleString()}</span>
                            <span style={{ fontWeight: 'bold', color: s.net >= 0 ? '#34d399' : '#f87171' }}>
                              손익 {s.net >= 0 ? '+' : '-'}{s.cur === '$' ? `$${Math.abs(s.net).toLocaleString()}` : Math.abs(s.net).toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* [탭 3] 통계 모드 */}
        {bottomTab === 3 && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {(['₩', '$'] as const).map(cur => {
              const targetType = statSubTab === 'withdrawal' ? 'withdrawal' : 'deposit';
              const targetTxs = monthlyTxs.filter(tx => tx.type === targetType && tx.currency === cur);
              const totalTargetAmount = targetTxs.reduce((acc, tx) => acc + tx.amount, 0);

              if (monthlyTxs.filter(tx => tx.currency === cur).length === 0) return null;

              let cumulativeDeg = 0;
              const siteStats = sites.map((siteObj) => {
                const amount = targetTxs.filter(tx => tx.siteName === siteObj.name).reduce((acc, tx) => acc + tx.amount, 0);
                const percentage = totalTargetAmount > 0 ? (amount / totalTargetAmount) * 100 : 0;
                
                const startDeg = cumulativeDeg;
                const degSpan = (percentage / 100) * 360;
                cumulativeDeg += degSpan;

                return { site: siteObj.name, amount, percentage, color: siteObj.color, startDeg, endDeg: cumulativeDeg };
              }).filter(s => s.amount > 0).sort((a, b) => b.amount - a.amount);

              let gradientStr = totalTargetAmount > 0 && siteStats.length > 0
                ? siteStats.map(item => `${item.color} ${item.startDeg}deg ${item.endDeg}deg`).join(', ')
                : '#333 0deg 360deg';

              return (
                <div key={cur} style={{ marginBottom: '14px', background: bgCard, padding: '14px', borderRadius: '12px', border: `1px solid ${borderCol}` }}>
                  <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', color: textSub, marginBottom: '2px' }}>
                      9월 {cur} {statSubTab === 'withdrawal' ? '환전' : '충전'} 통계
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: textMain }}>{cur === '$' ? `$${totalTargetAmount.toLocaleString()}` : totalTargetAmount.toLocaleString()}</div>

                    {totalTargetAmount > 0 && (
                      <div style={{ position: 'relative', width: '130px', height: '130px', margin: '16px auto' }}>
                        <div style={{ width: '130px', height: '130px', borderRadius: '50%', background: `conic-gradient(${gradientStr})`, boxSizing: 'border-box', border: `4px solid ${bgCard}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                          <div style={{ width: '74px', height: '74px', borderRadius: '50%', background: bgCard, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '8px', color: textSub }}>비중 1위</span>
                            <span style={{ fontSize: '11px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60px' }}>{siteStats[0]?.site}</span>
                          </div>
                        </div>

                        {siteStats.map((stat, idx) => {
                          const midAngle = (stat.startDeg + stat.endDeg) / 2;
                          const rad = (midAngle - 90) * (Math.PI / 180);
                          const radius = 72;
                          const x = Math.cos(rad) * radius;
                          const y = Math.sin(rad) * radius;
                          
                          return (
                            <div key={idx} style={{ position: 'absolute', top: `calc(50% + ${y}px)`, left: `calc(50% + ${x}px)`, transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', gap: '3px', pointerEvents: 'none' }}>
                              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: stat.color, border: '1px solid #fff' }}></div>
                              <span style={{ fontSize: '9px', fontWeight: 'bold', color: textMain, background: bgMain, padding: '1px 4px', borderRadius: '4px', border: `1px solid ${borderCol}`, whiteSpace: 'nowrap' }}>
                                {stat.site} {stat.percentage.toFixed(0)}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
                    {siteStats.map((stat, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: isDarkMode ? '#161616' : '#f8fafc', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#000' }}>
                            {stat.site.slice(0, 1)}
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{stat.site}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '11px', color: textSub, fontWeight: '600' }}>{stat.percentage.toFixed(0)}%</span>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: textMain }}>{cur === '$' ? `$${stat.amount.toLocaleString()}` : stat.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* [탭 4] 자산 모드 */}
        {bottomTab === 4 && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ background: bgCard, padding: '16px', borderRadius: '10px', border: `1px solid ${borderCol}`, textAlign: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', color: textSub }}>총 누적 손익</span>
              <div style={{ margin: '8px 0' }}>
                {(['₩', '$'] as const).map(cur => {
                  const dep = transactions.filter(tx => tx.type === 'deposit' && tx.currency === cur).reduce((a, b) => a + b.amount, 0);
                  const wit = transactions.filter(tx => tx.type === 'withdrawal' && tx.currency === cur).reduce((a, b) => a + b.amount, 0);
                  const bal = wit - dep;
                  if (dep === 0 && wit === 0) return null;
                  return (
                    <div key={cur} style={{ fontSize: '16px', fontWeight: '800', color: bal >= 0 ? '#34d399' : '#ff5252', margin: '4px 0' }}>
                      {bal >= 0 ? '+' : '-'}{cur === '$' ? `$${Math.abs(bal).toLocaleString()}` : Math.abs(bal).toLocaleString()}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>사이트별 총 누적 손익</div>
            {sites.map((siteObj, idx) => {
              const siteTxs = transactions.filter(tx => tx.siteName === siteObj.name);
              const siteSummary = (['₩', '$'] as const).map(cur => {
                const dep = siteTxs.filter(tx => tx.type === 'deposit' && tx.currency === cur).reduce((a, b) => a + b.amount, 0);
                const wit = siteTxs.filter(tx => tx.type === 'withdrawal' && tx.currency === cur).reduce((a, b) => a + b.amount, 0);
                const net = wit - dep;
                return { cur, net };
              }).filter(item => item.net !== 0);

              return (
                <div key={idx} style={{ background: bgCard, padding: '10px 12px', borderRadius: '8px', border: `1px solid ${borderCol}`, marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: siteObj.color }}></div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{siteObj.name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {siteSummary.length === 0 ? (
                      <span style={{ fontSize: '11px', color: textSub }}>내역 없음</span>
                    ) : (
                      siteSummary.map(s => (
                        <div key={s.cur} style={{ fontSize: '12px', fontWeight: 'bold', color: s.net >= 0 ? '#34d399' : '#ff5252' }}>
                          {s.net >= 0 ? '+' : '-'}{s.cur === '$' ? `$${Math.abs(s.net).toLocaleString()}` : Math.abs(s.net).toLocaleString()}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* [탭 5] 설정 모드 */}
        {bottomTab === 5 && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {settingView === 'main' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div onClick={() => setSettingView('siteManager')} style={{ background: bgCard, padding: '14px 16px', borderRadius: '10px', border: `1px solid ${borderCol}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold' }}>사이트 추가 및 색상 관리</div>
                  <span style={{ color: textSub }}>〉</span>
                </div>

                <div style={{ background: bgCard, padding: '14px 16px', borderRadius: '10px', border: `1px solid ${borderCol}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold' }}>화면 모드 (다크 / 라이트)</div>
                  <button 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    style={{ padding: '8px 14px', background: isDarkMode ? '#333' : '#e2e8f0', color: textMain, border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    {isDarkMode ? '🌙 다크모드' : '☀️ 라이트모드'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px', background: bgCard, padding: '14px', borderRadius: '12px', border: `1px solid ${borderCol}` }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold' }}>새 사이트 추가</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="사이트 이름 입력" 
                      value={newSiteNameInput}
                      onChange={(e) => setNewSiteNameInput(e.target.value)}
                      style={{ flex: 1, padding: '12px 14px', background: isDarkMode ? '#121212' : '#f8fafc', border: `1px solid ${borderCol}`, color: textMain, borderRadius: '8px', fontSize: '14px' }}
                    />
                    <button onClick={() => {
                      if (newSiteNameInput.trim() && !sites.some(s => s.name === newSiteNameInput.trim())) {
                        setSites([...sites, { name: newSiteNameInput.trim(), color: newSiteColorInput }]);
                        setNewSiteNameInput('');
                      }
                    }} style={{ padding: '12px 20px', background: '#ff5252', border: 'none', borderRadius: '8px', fontWeight: 'bold', color: '#fff', cursor: 'pointer', fontSize: '14px' }}>
                      추가
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {PRESET_COLORS.map(c => (
                      <div 
                        key={c}
                        onClick={() => setNewSiteColorInput(c)}
                        style={{ width: '26px', height: '26px', borderRadius: '50%', background: c, cursor: 'pointer', border: newSiteColorInput === c ? '2px solid #fff' : '2px solid transparent', boxSizing: 'border-box', flexShrink: 0 }}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {sites.map((sObj, idx) => (
                    <div key={idx} style={{ background: bgCard, padding: '16px 16px', borderRadius: '12px', border: `1px solid ${borderCol}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {editingSiteIndex === idx ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input 
                              type="text" 
                              value={editingSiteNameInput} 
                              onChange={(e) => setEditingSiteNameInput(e.target.value)}
                              style={{ flex: 1, padding: '10px 12px', background: isDarkMode ? '#121212' : '#f8fafc', color: textMain, border: `1px solid ${borderCol}`, borderRadius: '8px', fontSize: '14px' }} 
                            />
                            <button onClick={() => handleUpdateSite(sObj.name, editingSiteNameInput, editingSiteColorInput)} style={{ background: '#34d399', color: '#000', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>저장</button>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                            {PRESET_COLORS.map(c => (
                              <div 
                                key={c}
                                onClick={() => setEditingSiteColorInput(c)}
                                style={{ width: '24px', height: '24px', borderRadius: '50%', background: c, cursor: 'pointer', border: editingSiteColorInput === c ? '2px solid #fff' : '2px solid transparent', flexShrink: 0 }}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: sObj.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#000' }}>
                              {sObj.name.slice(0, 1)}
                            </div>
                            <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{sObj.name}</span>
                          </div>

                          <div style={{ display: 'flex', gap: '14px' }}>
                            <button onClick={() => { setEditingSiteIndex(idx); setEditingSiteNameInput(sObj.name); setEditingSiteColorInput(sObj.color); }} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold', padding: '4px' }}>수정</button>
                            <button onClick={() => setSites(sites.filter(item => item.name !== sObj.name))} style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold', padding: '4px' }}>삭제</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 오직 '달력' 탭(bottomTab === 1)에서만 (+) 입력 버튼 노출 (안전한 위치 배치) */}
      {bottomTab === 1 && (
        <div style={{ position: 'fixed', bottom: '110px', right: '24px', zIndex: 98 }}>
          <button 
            onClick={handleOpenAddModal}
            style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#3b82f6', color: '#fff', border: 'none', fontSize: '28px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            +
          </button>
        </div>
      )}

      {/* 하단 고정 네비게이션 바 */}
      <div style={{ position: 'fixed', bottom: '45px', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', height: '55px', background: bgCard, borderTop: `1px solid ${borderCol}`, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', zIndex: 99, alignItems: 'center' }}>
        {[
          { id: 1, label: '달력' },
          { id: 2, label: '상세' },
          { id: 3, label: '통계' },
          { id: 4, label: '자산' },
          { id: 5, label: '설정' },
        ].map(tab => (
          <div 
            key={tab.id} 
            onClick={() => { setBottomTab(tab.id); if (tab.id === 5) setSettingView('main'); }}
            style={{ textAlign: 'center', cursor: 'pointer', color: bottomTab === tab.id ? '#ff5252' : textSub, fontSize: '11px', fontWeight: bottomTab === tab.id ? 'bold' : 'normal' }}
          >
            <div>{tab.label}</div>
          </div>
        ))}
      </div>

      {/* 하단 배너 광고 영역 */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        height: '45px',
        background: bgCard,
        borderTop: `1px solid ${borderCol}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: textSub,
        fontSize: '11px',
        zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        광고 배너 영역 (하단 고정)
      </div>

      {/* 전체 화면형 입력 모달 */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: bgMain, zIndex: 2000, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', padding: '20px 24px', paddingTop: 'max(env(safe-area-inset-top), 24px)', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', color: textSub, fontWeight: '600' }}>{selectedDate.replace(/-/g, '/')} 입력</div>
              <span onClick={() => setIsModalOpen(false)} style={{ fontSize: '22px', cursor: 'pointer', color: textSub }}>✕</span>
            </div>

            {modalStep === 1 && (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', margin: '20px 0 16px 0', position: 'relative' }}>
                  <div style={{ position: 'relative' }}>
                    <div 
                      onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                      style={{ fontSize: '38px', fontWeight: 'bold', color: '#60a5fa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {currency} <span style={{ fontSize: '18px' }}>▼</span>
                    </div>

                    {isCurrencyDropdownOpen && (
                      <div style={{ position: 'absolute', top: '50px', left: 0, background: bgCard, border: `1px solid ${borderCol}`, borderRadius: '8px', zIndex: 3000, overflow: 'hidden', width: '80px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                        {(['₩', '$'] as const).map(c => (
                          <div 
                            key={c}
                            onClick={() => { setCurrency(c); setIsCurrencyDropdownOpen(false); }}
                            style={{ padding: '10px 12px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'center', borderBottom: `1px solid ${borderCol}`, color: currency === c ? '#60a5fa' : textMain }}
                          >
                            {c}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <span style={{ fontSize: '50px', fontWeight: '800', color: textMain, letterSpacing: '1px', flex: 1, textAlign: 'right' }}>
                    {currency === '$' ? `$${Number(amountInput).toLocaleString()}` : Number(amountInput).toLocaleString()}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '14px', margin: '20px 0 16px 0' }}>
                  <button 
                    onClick={() => { setTxType('withdrawal'); setModalStep(2); }} 
                    style={{ flex: 1, padding: '22px 10px', background: '#34d399', color: '#000', border: 'none', borderRadius: '16px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'center', boxShadow: '0 4px 16px rgba(52,211,153,0.3)' }}
                  >
                    수입 (환전)
                  </button>
                  <button 
                    onClick={() => { setTxType('deposit'); setModalStep(2); }} 
                    style={{ flex: 1, padding: '22px 10px', background: '#f87171', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'center', boxShadow: '0 4px 16px rgba(248,113,113,0.3)' }}
                  >
                    지출 (충전)
                  </button>
                </div>
              </>
            )}

            {modalStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 'bold' }}>사이트 선택 ({currency === '$' ? `$${Number(amountInput).toLocaleString()}` : Number(amountInput).toLocaleString()})</div>
                  <button onClick={() => setModalStep(1)} style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '13px', cursor: 'pointer' }}>〈 금액 수정</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px', background: bgCard, padding: '10px', borderRadius: '10px', border: `1px solid ${borderCol}` }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="새 사이트 추가" 
                      value={modalNewSiteInput}
                      onChange={(e) => setModalNewSiteInput(e.target.value)}
                      style={{ flex: 1, padding: '8px 10px', background: isDarkMode ? '#121212' : '#f8fafc', border: `1px solid ${borderCol}`, color: textMain, borderRadius: '8px', fontSize: '12px' }}
                    />
                    <button 
                      onClick={() => {
                        if (modalNewSiteInput.trim() && !sites.some(s => s.name === modalNewSiteInput.trim())) {
                          setSites([...sites, { name: modalNewSiteInput.trim(), color: modalNewSiteColor }]);
                          setModalNewSiteInput('');
                        }
                      }}
                      style={{ padding: '8px 14px', background: '#ff5252', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                    >
                      추가
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
                    {PRESET_COLORS.map(c => (
                      <div 
                        key={c}
                        onClick={() => setModalNewSiteColor(c)}
                        style={{ width: '18px', height: '18px', borderRadius: '50%', background: c, cursor: 'pointer', border: modalNewSiteColor === c ? '2px solid #fff' : '2px solid transparent' }}
                      />
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', overflowY: 'auto', flex: 1, paddingBottom: '20px', alignContent: 'start' }}>
                  {sites.map((siteObj, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleCompleteTransaction(siteObj.name)}
                      style={{ background: bgCard, border: `1px solid ${borderCol}`, borderRadius: '14px', padding: '16px 8px', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: siteObj.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000', fontSize: '13px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                        {siteObj.name.slice(0, 2)}
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: textMain, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>{siteObj.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {modalStep === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: 'auto' }}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map((keyVal, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (keyVal === '⌫') handleKeypadDelete();
                    else handleKeypadPress(keyVal);
                  }}
                  style={{ padding: '16px 0', background: bgCard, color: textMain, border: `1px solid ${borderCol}`, borderRadius: '12px', fontSize: '22px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {keyVal}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 전체 화면형 거래 수정 모달창 */}
      {editingTx && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: bgMain, zIndex: 2000, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', padding: '20px 24px', paddingTop: 'max(env(safe-area-inset-top), 24px)', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '15px', color: textSub, fontWeight: '600' }}>내역 수정 및 변경</div>
              <span onClick={() => setEditingTx(null)} style={{ fontSize: '22px', cursor: 'pointer', color: textSub }}>✕</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '20px 0' }}>
              <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#60a5fa' }}>{editCurrency}</span>
              <input 
                type="number" 
                value={editAmountInput} 
                onChange={(e) => setEditAmountInput(e.target.value)}
                style={{ background: 'transparent', border: 'none', fontSize: '42px', fontWeight: '800', color: textMain, width: '100%', outline: 'none' }} 
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', margin: '20px 0' }}>
              <button 
                onClick={() => setEditTxType('withdrawal')} 
                style={{ flex: 1, padding: '18px', background: editTxType === 'withdrawal' ? '#34d399' : '#222', color: editTxType === 'withdrawal' ? '#000' : textSub, border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'center' }}
              >
                수입 (환전)
              </button>
              <button 
                onClick={() => setEditTxType('deposit')} 
                style={{ flex: 1, padding: '18px', background: editTxType === 'deposit' ? '#f87171' : '#222', color: editTxType === 'deposit' ? '#fff' : textSub, border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'center' }}
              >
                지출 (충전)
              </button>
            </div>

            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '13px', color: textSub, marginBottom: '8px', fontWeight: '600' }}>사이트 변경</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                {sites.map((sObj, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setEditSiteName(sObj.name)}
                    style={{ background: editSiteName === sObj.name ? '#3b82f6' : bgCard, color: editSiteName === sObj.name ? '#fff' : textMain, border: `1px solid ${editSiteName === sObj.name ? '#3b82f6' : borderCol}`, borderRadius: '10px', padding: '12px 6px', textAlign: 'center', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {sObj.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
            <button onClick={() => handleDeleteTransaction(editingTx.id)} style={{ flex: 1, padding: '16px', background: '#f87171', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>삭제하기</button>
            <button onClick={handleUpdateTransaction} style={{ flex: 2, padding: '16px', background: '#34d399', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>수정 완료</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
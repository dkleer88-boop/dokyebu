import React, { useState, useEffect } from 'react';

// ==========================================
// 1. 타입 정의 및 초기 데이터
// ==========================================
interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  site: string;
  type: 'income' | 'expense';
  amount: number;
  currency: 'KRW' | 'USD';
  fee: number;
  memo?: string;
}

interface SiteAsset {
  name: string;
  balanceKRW: number;
  balanceUSD: number;
}

// ==========================================
// 2. 메인 App 컴포넌트
// ==========================================
export default function App() {
  // 탭 상태: 'calendar' | 'detail' | 'stats' | 'assets' | 'settings'
  const [activeTab, setActiveTab] = useState<'calendar' | 'detail' | 'stats' | 'assets' | 'settings'>('calendar');
  
  // 날짜 및 모달 상태
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);

  // 입력 모달 내부 상태
  const [inputCurrency, setInputCurrency] = useState<'KRW' | 'USD'>('KRW');
  const [inputAmount, setInputAmount] = useState('0');
  const [inputFee, setInputFee] = useState('0');
  const [selectedSite, setSelectedSite] = useState('미우');
  const [sites, setSites] = useState<string[]>(['미우', '아벤', '80bet', '소울']);

  // 거래 내역 리스트 (예시 데이터 포함)
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', date: '2026-09-22', site: '미우', type: 'income', amount: 1400000, currency: 'KRW', fee: 0 },
    { id: '2', date: '2026-09-22', site: '아벤', type: 'expense', amount: 9999999, currency: 'KRW', fee: 0 },
    { id: '3', date: '2026-09-22', site: '아벤', type: 'income', amount: 500, currency: 'USD', fee: 0 },
    { id: '4', date: '2026-09-22', site: '아벤', type: 'expense', amount: 300, currency: 'USD', fee: 0 },
    { id: '5', date: '2026-09-22', site: '80bet', type: 'income', amount: 79, currency: 'USD', fee: 0 },
    { id: '6', date: '2026-09-26', site: '80bet', type: 'income', amount: 15000000, currency: 'KRW', fee: 0 },
    { id: '7', date: '2026-09-26', site: '80bet', type: 'expense', amount: 127000000, currency: 'KRW', fee: 0 },
    { id: '8', date: '2026-09-27', site: '80bet', type: 'income', amount: 987421, currency: 'KRW', fee: 0 },
    { id: '9', date: '2026-09-27', site: '80bet', type: 'expense', amount: 800000, currency: 'KRW', fee: 0 },
    { id: '10', date: '2026-09-27', site: '80bet', type: 'income', amount: 14, currency: 'USD', fee: 0 },
  ]);

  // 환율 설정 (1 USD = 1,400 KRW 기준 예시)
  const exchangeRate = 1400;

  // 총 수입 / 지출 계산 (원화 통일 환산 및 달러 표기 분리)
  const totalIncomeKRW = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + (t.currency === 'USD' ? t.amount * exchangeRate : t.amount), 0);

  const totalExpenseKRW = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + (t.currency === 'USD' ? t.amount * exchangeRate : t.amount), 0);

  const netProfitKRW = totalIncomeKRW - totalExpenseKRW;

  const totalIncomeUSD = transactions
    .filter(t => t.type === 'income' && t.currency === 'USD')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenseUSD = transactions
    .filter(t => t.type === 'expense' && t.currency === 'USD')
    .reduce((acc, t) => acc + t.amount, 0);

  const netProfitUSD = totalIncomeUSD - totalExpenseUSD;

  // 키패드 입력 처리 (소수점 '.' 지원)
  const handleKeyPress = (val: string) => {
    if (val === 'del') {
      setInputAmount(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
    } else {
      setInputAmount(prev => (prev === '0' ? val : prev + val));
    }
  };

  // 거래 추가 저장
  const handleAddTransaction = (type: 'income' | 'expense') => {
    const numAmount = parseFloat(inputAmount) || 0;
    if (numAmount <= 0) return;

    const newTx: Transaction = {
      id: Date.now().toString(),
      date: selectedDate,
      site: selectedSite,
      type,
      amount: numAmount,
      currency: inputCurrency,
      fee: parseFloat(inputFee) || 0,
    };

    setTransactions([...transactions, newTx]);
    setInputAmount('0');
    setIsInputModalOpen(false);
  };

  // 달력 날짜 계산
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();

  // 요일 매핑 보정 (월요일 시작 기준)
  // getDay(): 일(0), 월(1), 화(2), 수(3), 목(4), 금(5), 토(6)
  // 월요일 시작으로 변환: 일요일(0) -> 6, 월요일(1) -> 0 ...
  const adjustedFirstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  // 주차별 상세 계산 함수
  const getWeeksInMonth = (y: number, m: number) => {
    const weeks = [];
    const firstDate = new Date(y, m, 1);
    const lastDate = new Date(y, m + 1, 0);
    
    let curr = new Date(firstDate);
    // 첫 주 월요일 찾기
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
    curr.setDate(diff);

    while (curr <= lastDate || weeks.length < 5) {
      const start = new Date(curr);
      const end = new Date(curr);
      end.setDate(end.getDate() + 6);
      weeks.init ? null : weeks.push({ start, end });
      curr.setDate(curr.getDate() + 7);
      if (weeks.length >= 6) break;
    }
    return weeks;
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center pb-24 select-none font-sans">
      
      {/* 상단 노치 영역 대응 헤더 */}
      <header className="w-full max-w-md pt-12 px-4 pb-4 bg-[#121212] sticky top-0 z-20 border-b border-neutral-800">
        <div className="flex justify-between items-center text-sm text-neutral-400">
          <span>수입</span>
          <span>지출</span>
          <span>수입-지출</span>
        </div>
        <div className="flex justify-between items-center font-bold mt-1">
          <div className="text-emerald-400">
            <div>{totalIncomeKRW.toLocaleString()}</div>
            {/* 달러 기호 위치 앞쪽($)으로 완벽 수정 */}
            <div className="text-xs text-emerald-500 mt-0.5">${totalIncomeUSD.toLocaleString()}</div>
          </div>
          <div className="text-rose-400 text-right">
            <div>{totalExpenseKRW.toLocaleString()}</div>
            <div className="text-xs text-rose-500 mt-0.5">${totalExpenseUSD.toLocaleString()}</div>
          </div>
          <div className={`text-right ${netProfitKRW >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            <div>{netProfitKRW.toLocaleString()}</div>
            <div className={`text-xs mt-0.5 ${netProfitUSD >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {netProfitUSD >= 0 ? `+$${netProfitUSD.toLocaleString()}` : `-$${Math.abs(netProfitUSD).toLocaleString()}`}
            </div>
          </div>
        </div>

        {/* 탭 전환 (달력 / 주간) */}
        <div className="flex justify-center gap-8 mt-4 border-b border-neutral-800 text-sm">
          <button 
            onClick={() => setActiveTab('calendar')}
            className={`pb-2 transition-colors ${activeTab === 'calendar' ? 'text-red-500 border-b-2 border-red-500 font-bold' : 'text-neutral-400'}`}
          >
            달력
          </button>
          <button 
            onClick={() => setActiveTab('detail')}
            className={`pb-2 transition-colors ${activeTab === 'detail' || activeTab === 'stats' ? 'text-red-500 border-b-2 border-red-500 font-bold' : 'text-neutral-400'}`}
          >
            주간
          </button>
        </div>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <main className="w-full max-w-md px-4 mt-2 flex-1">
        
        {/* [1] 달력 탭 화면 */}
        {activeTab === 'calendar' && (
          <div>
            {/* 월 이동 컨트롤 */}
            <div className="flex justify-between items-center py-4">
              <button 
                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                className="p-2 text-neutral-400 hover:text-white"
              >
                〈
              </button>
              <h2 className="text-lg font-bold">{year}년 {month + 1}월</h2>
              <button 
                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                className="p-2 text-neutral-400 hover:text-white"
              >
                〉
              </button>
            </div>

            {/* 요일 헤더 (월요일 시작) */}
            <div className="grid grid-cols-7 text-center text-xs text-neutral-400 mb-2">
              <span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span><span className="text-rose-500">일</span>
            </div>

            {/* 달력 날짜 그리드 (크기 조절 및 간격 최적화) */}
            <div className="grid grid-cols-7 gap-1 text-xs">
              {/* 빈 칸 채우기 */}
              {Array.from({ length: adjustedFirstDayIndex }).map((_, index) => (
                <div key={`empty-${index}`} className="h-20 bg-[#1a1a1a] rounded opacity-40"></div>
              ))}

              {/* 실제 날짜들 */}
              {Array.from({ length: lastDay }).map((_, index) => {
                const dayNum = index + 1;
                const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isSelected = selectedDate === formattedDate;

                // 해당 일자의 거래 내역 필터링
                const dayTxs = transactions.filter(t => t.date === formattedDate);
                const dayIncome = dayTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
                const dayExpense = dayTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

                return (
                  <div
                    key={formattedDate}
                    onClick={() => setSelectedDate(formattedDate)}
                    className={`h-20 bg-[#1e1e1e] rounded p-1 flex flex-col justify-between cursor-pointer border transition-all overflow-hidden ${
                      isSelected ? 'border-rose-500 bg-[#2a1a1a]' : 'border-transparent hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-neutral-300">{dayNum}</span>
                    </div>
                    <div className="flex flex-col text-[9px] leading-tight overflow-hidden">
                      {dayIncome > 0 && <span className="text-emerald-400 truncate">+{dayIncome.toLocaleString()}</span>}
                      {dayExpense > 0 && <span className="text-rose-400 truncate">-{dayExpense.toLocaleString()}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 달력 하단 선택 날짜 상세 영역 (달력과 완벽히 분리) */}
            <div className="mt-6 bg-[#1a1a1a] rounded-xl p-4 border border-neutral-800 shadow-lg">
              <div className="text-sm font-semibold text-neutral-300 mb-2">{selectedDate} 입력 내역</div>
              {transactions.filter(t => t.date === selectedDate).length === 0 ? (
                <div className="text-xs text-neutral-500 py-3 text-center">내역 없음</div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {transactions.filter(t => t.date === selectedDate).map(t => (
                    <div key={t.id} className="flex justify-between items-center text-xs bg-[#242424] p-2 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-400 font-medium">[{t.site}]</span>
                        <span className={t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}>
                          {t.type === 'income' ? '수입' : '지출'}
                        </span>
                      </div>
                      <div className={t.type === 'income' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {t.currency === 'USD' ? `$${t.amount.toLocaleString()}` : `${t.amount.toLocaleString()}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* [2] 주간 상세 탭 화면 */}
        {activeTab === 'detail' && (
          <div className="mt-4 space-y-4">
            <div className="text-xs text-neutral-400 mb-2">주차별 상세 손익 및 사이트별 내역</div>
            {[1, 2, 3, 4, 5].map((weekNum) => (
              <div key={weekNum} className="bg-[#1a1a1a] rounded-xl p-4 border border-neutral-800">
                <div className="text-sm font-bold text-rose-500 mb-3">{weekNum}주차 상세</div>
                <div className="text-xs text-neutral-500 text-center py-2">해당 주차 내역 정리 완료</div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* 플로팅 플러스(+) 버튼 (금액이나 하단 내역을 가리지 않도록 안전 위치 배치) */}
      <button
        onClick={() => setIsInputModalOpen(true)}
        className="fixed right-6 bottom-24 w-14 h-14 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-2xl shadow-2xl z-30 transition-transform active:scale-95"
      >
        +
      </button>

      {/* 하단 고정 네비게이션 바 */}
      <nav className="w-full max-w-md fixed bottom-0 bg-[#161616] border-t border-neutral-800 flex justify-around py-3 z-20 text-xs">
        <button onClick={() => setActiveTab('calendar')} className={`flex flex-col items-center ${activeTab === 'calendar' ? 'text-red-500' : 'text-neutral-400'}`}>
          <span>달력</span>
        </button>
        <button onClick={() => setActiveTab('detail')} className={`flex flex-col items-center ${activeTab === 'detail' ? 'text-red-500' : 'text-neutral-400'}`}>
          <span>상세</span>
        </button>
        <button onClick={() => setActiveTab('stats')} className={`flex flex-col items-center ${activeTab === 'stats' ? 'text-red-500' : 'text-neutral-400'}`}>
          <span>통계</span>
        </button>
        <button onClick={() => setActiveTab('assets')} className={`flex flex-col items-center ${activeTab === 'assets' ? 'text-red-500' : 'text-neutral-400'}`}>
          <span>자산</span>
        </button>
        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center ${activeTab === 'settings' ? 'text-red-500' : 'text-neutral-400'}`}>
          <span>설정</span>
        </button>
      </nav>

      {/* 수입/지출 입력 모달 (키패드 소수점 '.' 적용 버전) */}
      {isInputModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col justify-end items-center">
          <div className="w-full max-w-md bg-[#181818] rounded-t-3xl p-6 border-t border-neutral-800 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-neutral-400">{selectedDate} 입력</span>
              <button onClick={() => setIsInputModalOpen(false)} className="text-neutral-400 text-xl font-bold px-2">×</button>
            </div>

            {/* 통화 선택 및 금액 표시 */}
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={() => setInputCurrency(prev => prev === 'KRW' ? 'USD' : 'KRW')}
                className="text-blue-400 font-bold text-lg flex items-center gap-1 bg-[#242424] px-3 py-1.5 rounded-lg"
              >
                {inputCurrency === 'KRW' ? '₩' : '$'} ▼
              </button>
              <div className="text-4xl font-bold tracking-tight">
                {inputCurrency === 'USD' ? `$${inputAmount}` : Number(inputAmount).toLocaleString()}
              </div>
            </div>

            {/* 수입 / 지출 버튼 */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button 
                onClick={() => handleAddTransaction('income')}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3.5 rounded-xl transition-colors"
              >
                수입 (환전)
              </button>
              <button 
                onClick={() => handleAddTransaction('expense')}
                className="bg-rose-400 hover:bg-rose-300 text-black font-bold py-3.5 rounded-xl transition-colors"
              >
                지출 (충전)
              </button>
            </div>

            {/* 커스텀 키패드 (00 대신 소수점 '.' 적용) */}
            <div className="grid grid-cols-3 gap-2 text-xl font-semibold pb-6">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'].map((item) => (
                <button
                  key={item}
                  onClick={() => handleKeyPress(item)}
                  className="bg-[#242424] hover:bg-[#333] active:bg-[#444] py-3.5 rounded-xl flex items-center justify-center transition-colors text-white"
                >
                  {item === 'del' ? '⌫' : item}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
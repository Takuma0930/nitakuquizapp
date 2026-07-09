import React, { useState, useEffect } from 'react';

// --- 日本のリアルな統計データ ---
const PREFECTURE_DATA = [
  { name: '北海道', population: 5224614, area: 83424, rice: 641000 },
  { name: '東京都', population: 14047594, area: 2194, rice: 600 },
  { name: '神奈川県', population: 9237337, area: 2416, rice: 12000 },
  { name: '大阪府', population: 8837648, area: 1905, rice: 27000 },
  { name: '愛知県', population: 7542415, area: 5173, rice: 102000 },
  { name: '埼玉県', population: 7344765, area: 3797, rice: 62000 },
  { name: '千葉県', population: 6284400, area: 5157, rice: 265000 },
  { name: '兵庫県', population: 5465002, area: 8401, rice: 144000 },
  { name: '福岡県', population: 5135214, area: 4987, rice: 140000 },
  { name: '静岡県', population: 3633202, area: 7777, rice: 33000 },
  { name: '茨城県', population: 2867004, area: 6094, rice: 337000 },
  { name: '広島県', population: 2798378, area: 8479, rice: 83000 },
  { name: '京都府', population: 2579921, area: 4612, rice: 52000 },
  { name: '宮城県', population: 2301996, area: 7282, rice: 361000 },
  { name: '新潟県', population: 2201275, area: 12584, rice: 593000 },
  { name: '長野県', population: 2048011, area: 13562, rice: 115000 },
  { name: '秋田県', population: 959502, area: 11638, rice: 444000 },
  { name: '高知県', population: 691527, area: 7103, rice: 31000 },
  { name: '鳥取県', population: 553407, area: 3507, rice: 49000 },
  { name: '香川県', population: 950244, area: 1877, rice: 47000 },
];

const GENRES = [
  { key: 'population', unit: '人', questionText: '【人口が多かった】' },
  { key: 'area', unit: '㎢', questionText: '【面積が広い】' },
  { key: 'rice', unit: 'トン', questionText: '【お米の生産量（収穫量）が多い】' },
];

const SELECTABLE_OPTIONS = [
  { id: 'random', name: '🎲 すべてランダム（ごちゃ混ぜ）' },
  { id: 'population', name: '👥 人口（どっちが多い？）' },
  { id: 'area', name: '🗺️ 面積（どっちが広い？）' },
  { id: 'rice', name: '🌾 お米の生産量（どっちが多い？）' },
];

const MODE_OPTIONS = [
  { id: 'normal', name: '🎮 通常モード', description: 'じっくり考えて回答' },
  { id: 'time', name: '⏱️ タイムアタック', description: '1問ごとに10秒以内で回答' },
  { id: 'fail-fast', name: '💥 1ミスで即終了', description: '1問でも間違えたら終了' },
];

const COMPARISON_OPTIONS = [
  { id: 'more', name: '📈 多い・大きい', description: 'より多い・より大きい方を選ぶ' },
  { id: 'less', name: '📉 少ない・小さい', description: 'より少ない・より小さい方を選ぶ' },
];

const TIME_LIMIT_SECONDS = 10;

const createQuizData = (selectedOption, numQuizzes, comparisonMode) => {
  const quizzes = [];

  for (let i = 0; i < numQuizzes; i++) {
    let activeGenre;
    if (selectedOption === 'random') {
      const randomIndex = Math.floor(Math.random() * GENRES.length);
      activeGenre = GENRES[randomIndex];
    } else {
      activeGenre = GENRES.find(g => g.key === selectedOption);
    }

    const pref1Index = Math.floor(Math.random() * PREFECTURE_DATA.length);
    let pref2Index = Math.floor(Math.random() * PREFECTURE_DATA.length);
    while (pref1Index === pref2Index) {
      pref2Index = Math.floor(Math.random() * PREFECTURE_DATA.length);
    }
    
    const pref1 = PREFECTURE_DATA[pref1Index];
    const pref2 = PREFECTURE_DATA[pref2Index];

    const val1 = pref1[activeGenre.key];
    const val2 = pref2[activeGenre.key];

    const isPref1More = val1 > val2;
    const isCorrectForMore = comparisonMode === 'more' ? isPref1More : !isPref1More;
    const correctAnswer = isCorrectForMore ? pref1.name : pref2.name;
    const incorrectAnswer = isCorrectForMore ? pref2.name : pref1.name;

    const details = `${pref1.name}: ${val1.toLocaleString()}${activeGenre.unit}\n${pref2.name}: ${val2.toLocaleString()}${activeGenre.unit}`;

    const comparisonText = comparisonMode === 'more' ? '多い' : '少ない';
    const genreText = activeGenre.key === 'area' ? '広い' : activeGenre.key === 'rice' ? '多い' : '多い';
    const questionText = activeGenre.key === 'area'
      ? `【面積が${comparisonMode === 'more' ? '広い' : '狭い'}】`
      : activeGenre.key === 'rice'
        ? `【お米の生産量（収穫量）が${comparisonMode === 'more' ? '多い' : '少ない'}】`
        : `【人口が${comparisonMode === 'more' ? '多かった' : '少なかった'}】`;

    quizzes.push({
      question: `💡「${pref1.name}」と「${pref2.name}」、${questionText}のはどっち？`,
      correct_answer: correctAnswer,
      incorrect_answers: [incorrectAnswer],
      details: details
    });
  }

  return quizzes;
};

function App() {
  const [selectedGenre, setSelectedGenre] = useState('random');
  const [questionCount, setQuestionCount] = useState(5);
  const [gameMode, setGameMode] = useState('normal');
  const [comparisonMode, setComparisonMode] = useState('more');
  const [viewMode, setViewMode] = useState('menu');

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizOver, setQuizOver] = useState(false);
  const [displayQuestion, setDisplayQuestion] = useState('');
  const [displayAnswers, setDisplayAnswers] = useState([]);
  const [results, setResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS);
  const [questionResolved, setQuestionResolved] = useState(false);
  const [pendingGameOver, setPendingGameOver] = useState(false);

  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    title: '解説',
    message: '',
    details: '',
    isCorrect: false
  });

  // 🌟 ここがポイント：起動時に画面全体（body）の背景色を強制的に上書きします！
  useEffect(() => {
    // 画面全体の背景を優しいブルーグレーにする
    document.body.style.backgroundColor = '#f0f4f8';
    document.body.style.margin = '0';
    // クリーンアップ関数（他の画面に影響を出さないためのおまじない）
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.margin = '';
    };
  }, []);

  const startStatQuiz = () => {
    setViewMode('quiz');
    setCurrentIndex(0);
    setScore(0);
    setQuizOver(false);
    setDisplayQuestion('');
    setDisplayAnswers([]);
    setResults([]);
    setTimeLeft(TIME_LIMIT_SECONDS);
    setQuestionResolved(false);
    setPendingGameOver(false);
    setModalInfo({
      isOpen: false,
      title: '解説',
      message: '',
      details: '',
      isCorrect: false
    });
    const quizData = createQuizData(selectedGenre, questionCount, comparisonMode);
    setQuestions(quizData);
  };

  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      const currentQuestion = questions[currentIndex];
      setDisplayQuestion(currentQuestion.question);
      setQuestionResolved(false);
      
      const answers = [
        currentQuestion.correct_answer,
        ...currentQuestion.incorrect_answers
      ].sort(() => Math.random() - 0.5);
      
      setDisplayAnswers(answers);
    }
  }, [questions, currentIndex]);

  useEffect(() => {
    if (viewMode === 'quiz' && !quizOver && gameMode === 'time' && questions.length > 0) {
      setTimeLeft(TIME_LIMIT_SECONDS);
    }
  }, [viewMode, quizOver, gameMode, currentIndex, questions.length]);

  useEffect(() => {
    if (viewMode !== 'quiz' || quizOver || gameMode !== 'time' || modalInfo.isOpen || questionResolved || questions.length === 0) {
      return;
    }

    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [viewMode, quizOver, gameMode, modalInfo.isOpen, questions.length, currentIndex, timeLeft]);

  const handleTimeUp = () => {
    if (questionResolved) {
      return;
    }

    setQuestionResolved(true);

    const currentQ = questions[currentIndex];
    const isCorrect = false;

    setResults((prev) => [
      ...prev,
      {
        question: currentQ.question,
        selectedAnswer: '（時間切れ）',
        isCorrect,
        correctAnswer: currentQ.correct_answer,
        details: currentQ.details
      }
    ]);

    setModalInfo({
      isOpen: true,
      title: '📖 解説',
      message: `時間切れ！⏰\n正解は: ${currentQ.correct_answer}`,
      details: currentQ.details,
      isCorrect: false
    });
  };

  const handleAnswerClick = (answer, wasTimeout = false) => {
    if (questionResolved) {
      return;
    }

    setQuestionResolved(true);

    const currentQ = questions[currentIndex];
    const isCorrect = wasTimeout ? false : answer === currentQ.correct_answer;
    const selectedAnswer = wasTimeout ? '（時間切れ）' : answer;

    setResults((prev) => [
      ...prev,
      {
        question: currentQ.question,
        selectedAnswer,
        isCorrect,
        correctAnswer: currentQ.correct_answer,
        details: currentQ.details
      }
    ]);

    if (gameMode === 'fail-fast' && !isCorrect) {
      setPendingGameOver(true);
      setModalInfo({
        isOpen: true,
        title: '📖 解説',
        message: `不正解... 😭\n正解は: ${currentQ.correct_answer}`,
        details: currentQ.details,
        isCorrect: false
      });
      return;
    }

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setModalInfo({
        isOpen: true,
        title: '📖 解説',
        message: '正解！🎉',
        details: currentQ.details,
        isCorrect: true
      });
    } else {
      setModalInfo({
        isOpen: true,
        title: '📖 解説',
        message: `不正解... 😭\n正解は: ${currentQ.correct_answer}`,
        details: currentQ.details,
        isCorrect: false
      });
    }
  };

  const handleCloseModal = () => {
    setModalInfo({ ...modalInfo, isOpen: false });

    if (pendingGameOver) {
      setPendingGameOver(false);
      setQuizOver(true);
      return;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentIndex(nextIndex);
    } else {
      setQuizOver(true);
    }
  };

  const isFinalStep = pendingGameOver || currentIndex + 1 >= questions.length;

  // 画面の共通ラッパー（余白などが綺麗になるように全体を囲む）
  const renderScreen = () => {
    // 1. スタートメニュー画面
    if (viewMode === 'menu') {
      return (
        <div style={{ maxWidth: '500px', margin: '50px auto', padding: '40px 30px', border: '2px solid #222222', borderRadius: '12px', textAlign: 'center', backgroundColor: '#ffffff', color: '#000000', boxShadow: '0 8px 16px rgba(0,0,0,0.05)', fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: '26px', marginBottom: '10px', color: '#000000' }}>📊 日本の統計雑学クイズ</h1>
          <p style={{ color: '#555555', marginBottom: '30px', fontSize: '15px' }}>挑戦したいクイズの設定を選んでください！</p>

          <div style={{ marginBottom: '15px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '16px' }}>クイズのジャンル：</label>
            <select 
              value={selectedGenre} 
              onChange={(e) => setSelectedGenre(e.target.value)} 
              style={{ width: '100%', padding: '12px', fontSize: '16px', borderRadius: '6px', border: '2px solid #222222', backgroundColor: '#f8f9fa', color: '#000000', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {SELECTABLE_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '30px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '16px' }}>問題数：</label>
            <select 
              value={questionCount} 
              onChange={(e) => setQuestionCount(Number(e.target.value))} 
              style={{ width: '100%', padding: '12px', fontSize: '16px', borderRadius: '6px', border: '2px solid #222222', backgroundColor: '#f8f9fa', color: '#000000', fontWeight: 'bold', cursor: 'pointer' }}
            >
              <option value={5}>サクッと 5問</option>
              <option value={10}>ふつうに 10問</option>
              <option value={15}>じっくり 15問</option>
              <option value={20}>がっつり 20問</option>
            </select>
          </div>

          <div style={{ marginBottom: '30px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '16px' }}>モード：</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {MODE_OPTIONS.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setGameMode(mode.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: gameMode === mode.id ? '2px solid #007bff' : '2px solid #d0d7de',
                    backgroundColor: gameMode === mode.id ? '#eaf4ff' : '#ffffff',
                    color: '#000000',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  <div>{mode.name}</div>
                  <div style={{ fontSize: '13px', fontWeight: 'normal', color: '#555555', marginTop: '2px' }}>{mode.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '30px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '16px' }}>比較の向き：</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {COMPARISON_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setComparisonMode(option.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: comparisonMode === option.id ? '2px solid #28a745' : '2px solid #d0d7de',
                    backgroundColor: comparisonMode === option.id ? '#eaf7ee' : '#ffffff',
                    color: '#000000',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  <div>{option.name}</div>
                  <div style={{ fontSize: '13px', fontWeight: 'normal', color: '#555555', marginTop: '2px' }}>{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={startStatQuiz} style={{ padding: '15px 40px', fontSize: '18px', backgroundColor: '#007bff', color: '#ffffff', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', width: '100%', marginBottom: '15px' }}>
            クイズを開始する 🚀
          </button>

          <button onClick={() => setViewMode('info')} style={{ padding: '12px 40px', fontSize: '16px', backgroundColor: '#6c757d', color: '#ffffff', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
            🗺️ 都道府県の統計データを見る
          </button>
        </div>
      );
    }

    // 2. 都道府県の統計データ図鑑画面
    if (viewMode === 'info') {
      return (
        <div style={{ maxWidth: '700px', margin: '40px auto', padding: '30px 20px', border: '2px solid #222222', borderRadius: '12px', backgroundColor: '#ffffff', color: '#000000', fontFamily: 'sans-serif', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}>
          <h2 style={{ textAlign: 'center', color: '#555', marginBottom: '5px' }}>🗺️ 都道府県統計データ一覧</h2>
          <p style={{ textAlign: 'center', color: '#555', fontSize: '14px', marginBottom: '20px' }}>クイズに登場する都道府県のリアルな数値です</p>
          
          <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'scroll', border: '1px solid #ccc', borderRadius: '6px', marginBottom: '25px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '15px' }}>
              <thead>
                <tr style={{ backgroundColor: '#e9ecef', position: 'sticky', top: 0, borderBottom: '2px solid #222' }}>
                  <th style={{ padding: '12px 10px' }}>都道府県</th>
                  <th style={{ padding: '12px 10px' }}>👥 人口</th>
                  <th style={{ padding: '12px 10px' }}>🗺️ 面積</th>
                  <th style={{ padding: '12px 10px' }}>🌾 米生産量</th>
                </tr>
              </thead>
              <tbody>
                {PREFECTURE_DATA.map((pref, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #dee2e6', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8f9fa' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{pref.name}</td>
                    <td style={{ padding: '10px' }}>{pref.population.toLocaleString()} 人</td>
                    <td style={{ padding: '10px' }}>{pref.area.toLocaleString()} ㎢</td>
                    <td style={{ padding: '10px' }}>{pref.rice.toLocaleString()} トン</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={() => setViewMode('menu')} style={{ padding: '12px 24px', fontSize: '16px', backgroundColor: '#222222', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'block', margin: '0 auto' }}>
            メニューに戻る ↩
          </button>
        </div>
      );
    }

    // 3. クイズプレイ中画面 (さっきの赤と青のボタン画面)
    if (viewMode === 'quiz' && !quizOver) {
      return (
        <div style={{ maxWidth: '600px', margin: '50px auto', padding: '30px', border: '2px solid #222222', borderRadius: '12px', backgroundColor: '#ffffff', color: '#000000', boxShadow: '0 8px 16px rgba(0,0,0,0.05)', fontFamily: 'sans-serif', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ color: '#555555', fontWeight: 'bold', fontSize: '16px' }}>第 {currentIndex + 1} / {questions.length} 問</div>
            {gameMode === 'time' && (
              <div style={{ color: timeLeft <= 3 ? '#e53935' : '#007bff', fontWeight: 'bold', fontSize: '16px' }}>
                残り {timeLeft}秒
              </div>
            )}
          </div>
          <div style={{ color: '#6c757d', marginBottom: '15px', fontSize: '14px' }}>
            {gameMode === 'time' ? '⏱️ タイムアタック：制限時間内に答えてください' : gameMode === 'fail-fast' ? '💥 1ミスで即終了です' : '🎮 通常モードで進めます'}
          </div>
          <p style={{ fontSize: '20px', fontWeight: 'bold', lineHeight: '1.6', marginBottom: '25px', color: '#000000' }}>{displayQuestion}</p>
          
          <div style={{ display: 'flex', flexDirection: 'row', gap: '15px' }}>
            {displayAnswers.map((answer, index) => (
              <button
                key={index}
                onClick={() => handleAnswerClick(answer)}
                style={{ 
                  flex: 1, 
                  padding: '24px 16px', 
                  fontSize: '22px', 
                  fontWeight: 'bold', 
                  textAlign: 'center', 
                  cursor: 'pointer', 
                  borderRadius: '8px', 
                  border: '3px solid #222222', 
                  backgroundColor: index === 0 ? '#e53935' : '#1e88e5', 
                  color: '#ffffff', 
                  boxShadow: '0 4px 0 #222222', 
                  display: 'block', 
                  transition: 'transform 0.1s, box-shadow 0.1s'
                }}
                onMouseDown={(e) => {
                  e.target.style.transform = 'translateY(4px)';
                  e.target.style.boxShadow = '0 0px 0 #222222';
                }}
                onMouseUp={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 0 #222222';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 0 #222222';
                }}
              >
                {answer}
              </button>
            ))}
          </div>

          {/* 解説ポップアップ */}
          {modalInfo.isOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', maxWidth: '400px', width: '85%', textAlign: 'center', border: '3px solid #222222', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                <h3 style={{ marginTop: 0, borderBottom: '2px solid #eeeeee', paddingBottom: '12px', fontSize: '20px', color: '#222222' }}>{modalInfo.title}</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', whiteSpace: 'pre-line', margin: '20px 0', color: modalInfo.isCorrect ? '#e53935' : '#1e88e5' }}>{modalInfo.message}</p>
                <p style={{ fontSize: '16px', backgroundColor: '#f1f3f5', padding: '20px', borderRadius: '8px', margin: '20px 0', whiteSpace: 'pre-line', fontWeight: 'bold', color: '#333' }}>{modalInfo.details}</p>
                <button onClick={handleCloseModal} style={{ padding: '14px 30px', fontSize: '18px', backgroundColor: '#007bff', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
                  {isFinalStep ? '結果画面へ 🏁' : '次の問題へ ⏭️'}
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // 4. クイズ結果画面
    if (quizOver) {
      return (
        <div style={{ maxWidth: '500px', margin: '50px auto', padding: '40px 30px', border: '2px solid #222222', borderRadius: '12px', textAlign: 'center', backgroundColor: '#ffffff', color: '#000000', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#000000' }}>クイズ終了！🏁</h2>
          <p style={{ fontSize: '24px', color: '#000000', margin: '20px 0' }}>あなたのスコア: <strong>{score} / {questions.length}</strong></p>

          <div style={{ textAlign: 'left', marginBottom: '24px', maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px', padding: '12px', backgroundColor: '#f8f9fa' }}>
            {results.map((result, index) => (
              <div key={index} style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: index === results.length - 1 ? 'none' : '1px solid #e9ecef' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#000000' }}>
                  {index + 1}. {result.isCorrect ? '✅ 正解' : '❌ 不正解'}
                </div>
                <div style={{ fontSize: '14px', color: '#333333', marginBottom: '4px' }}>
                  <strong>問題:</strong> {result.question}
                </div>
                <div style={{ fontSize: '14px', color: '#333333', marginBottom: '4px' }}>
                  <strong>あなたの解答:</strong> {result.selectedAnswer}
                </div>
                <div style={{ fontSize: '14px', color: '#333333', marginBottom: '4px' }}>
                  <strong>正解:</strong> {result.correctAnswer}
                </div>
                <div style={{ fontSize: '14px', color: '#555555', whiteSpace: 'pre-line', backgroundColor: '#ffffff', padding: '8px', borderRadius: '6px', marginTop: '6px' }}>
                  {result.details}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={startStatQuiz} style={{ padding: '12px 24px', fontSize: '16px', backgroundColor: '#28a745', color: '#ffffff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              もう一度クイズをする 🔁
            </button>
            <button onClick={() => window.location.reload()} style={{ padding: '12px 24px', fontSize: '16px', backgroundColor: '#6c757d', color: '#ffffff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              メニュー画面に戻る 🔄
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  // 全体を包むメインのdiv
  return (
    <div style={{ minHeight: '100vh', width: '100%', padding: '1px' }}>
      {renderScreen()}
    </div>
  );
}

export default App;
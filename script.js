(() => {
  const canvas = document.getElementById('world');
  const ctx = canvas.getContext('2d');
  const W = 960, H = 540;

  // NẠP ẢNH NỀN ĐIỆN TRIỀU KIẾN
  const bgImg = new Image();
  bgImg.src = 'bg.jpg';
  let bgLoaded = false;
  bgImg.onload = () => { bgLoaded = true; };

  const start = {
    day: 1, pop: 72, happy: 48, food: 42, gold: 28, debt: 90,
    witch: 0, church: 0, levy: 0, aid: 0, seed: 814, log: [], ended: false,
    petitions: []
  };

  let s = { ...start };
  let pointer = { x: -999, y: -999 };
  let hovered = null;
  let frame = 0;
  let active = false;

  const dayFlavors = [
    "Ánh nến lung linh soi sáng các bức tường đá trong điện triều kiến...",
    "Tiếng chuông sớm vang vọng qua những dãy hành lang nguy nga...",
    "Bóng tối dần lùi bước trước ánh sáng từ các ô cửa kính màu...",
    "Các vệ sĩ đứng nghiêm trang bên thảm đỏ đợi lệnh...",
    "Gió lạnh luồn qua kẽ cửa đại sảnh, báo hiệu một ngày bận rộn...",
    "Một ngày mới bắt đầu với những sớ trình tấu chưa hồi kết..."
  ];

  const folks = [
    { id: 'steward', x: 380, y: 330, name: 'Quản gia', color: '#9fbd9d', hair: '#d2c3a3', shirt: '#576b50', hat: true },
    { id: 'priest', x: 580, y: 330, name: 'Tu sĩ trưởng', color: '#d9c9a7', hair: '#786d56', shirt: '#b4a989', hood: true },
    { id: 'guard', x: 720, y: 350, name: 'Đội trưởng', color: '#dbc294', hair: '#5c4637', shirt: '#6a7773', hat: true },
    { id: 'mother', x: 240, y: 370, name: 'Bà mẹ góa', color: '#d0b8a2', hair: '#463a34', shirt: '#76534a' },
    { id: 'merchant', x: 210, y: 290, name: 'Thương nhân', color: '#d2ad79', hair: '#50413a', shirt: '#85613d', hat: true },
    { id: 'blacksmith', x: 310, y: 260, name: 'Thợ rèn', color: '#c7aa8b', hair: '#392c28', shirt: '#60504a' },
    { id: 'witch', x: 750, y: 270, name: 'Phù thủy', color: '#b8a4cf', hair: '#302438', shirt: '#574265', hood: true }
  ];

  const eventsPool = [
    {
      id: 'e_steward_1', npcId: 'steward', speaker: 'Quản gia', title: 'Chiếc ghế lạnh', tag: 'Triều kiến',
      description: 'Cha ngươi để lại lâu đài rệu rã và 90 vàng nợ. Quản gia xin ý kiến xử lý kho bạc.',
      quote: '“Lãnh chúa mới, chúng ta phải quyết định nguồn thu ngay.”',
      maxDays: 2,
      ignoredEffect: 'happy:-5;gold:-5',
      ignoredMsg: 'Bỏ mặc quản gia: Ngân khố thất thoát do không có kế hoạch rõ ràng.',
      choices: [
        ['Bán đồ quý trong kho', 'gold:13;happy:-2', 'Thêm vàng, dân thấy tài sản bị bán'],
        ['Phát lương thực', 'food:15;happy:5', 'Giữ lòng dân, kho sẽ vơi nhanh'],
        ['Giảm thuế mùa đông', 'happy:8;gold:-5', 'Dân phấn chấn, ngân khố hụt']
      ]
    },
    {
      id: 'e_mother_1', npcId: 'mother', speaker: 'Bà mẹ góa', title: 'Đứa trẻ trong tuyết', tag: 'Dân nguyện',
      description: 'Mái nhà bị sập trong đêm lạnh. Người mẹ quỳ xin giúp đỡ cho đứa con đang sốt cao.',
      quote: '“Xin ngài đừng để nó chết ngay trước cửa lâu đài.”',
      maxDays: 2,
      ignoredEffect: 'pop:-3;happy:-8',
      ignoredMsg: 'Bỏ mặc Bà mẹ góa: Đứa trẻ qua đời trong đêm, dân chúng phẫn nộ.',
      choices: [
        ['Mở kho cứu trợ', 'food:-12;happy:9', 'Dân sẽ ghi nhớ'],
        ['Cho họ vào làm công', 'gold:-4;pop:3;happy:4', 'Thêm miệng ăn, thêm đôi tay'],
        ['Đuổi họ đi', 'happy:-10;pop:-2', 'Giữ lại phần dự trữ']
      ]
    },
    {
      id: 'e_merchant_1', npcId: 'merchant', speaker: 'Thương nhân Oren', title: 'Chuyến hàng gặp nạn', tag: 'Thương mại',
      description: 'Xe hàng bị mắc kẹt ngoài bờ sông. Thương nhân xin lực lượng ứng cứu gấp.',
      quote: '“Mỗi giờ trôi qua hàng hóa của tôi lại chìm thêm dưới bùn!”',
      maxDays: 2,
      ignoredEffect: 'gold:-8;happy:-3',
      ignoredMsg: 'Bỏ mặc Thương nhân: Chuyến hàng bị cướp sạch, thương nhân rời bỏ thành.',
      choices: [
        ['Cứu hàng, nhận tiền', 'gold:16;happy:2', 'Mất một ngày công'],
        ['Mua rẻ số hàng hư', 'gold:-6;food:20', 'Đầu tư để có lương thực'],
        ['Tịch thu cả chuyến', 'gold:24;happy:-12', 'Thương nhân sẽ truyền tai nhau']
      ]
    },
    {
      id: 'e_witch_1', npcId: 'witch', speaker: 'Mụ phù thủy', title: 'Giá của điều ước', tag: 'Lời thì thầm',
      description: 'Dưới giếng cạn vang lên giọng nói ngọt ngào chìa ra những đồng vàng mới đúc.',
      quote: '“Một sinh mạng cho một túi vàng. Ai sẽ đếm người mất tích?”',
      maxDays: 3,
      ignoredEffect: 'happy:-4;witch:1',
      ignoredMsg: 'Bỏ mặc Phù thủy: Một người dân bỗng nhiên mất tích bí ẩn!',
      choices: [
        ['Hiến tế một nhóm dân', 'gold:24;pop:-5;happy:-4;witch:1', 'Vàng nhanh · nguy cơ bị phát hiện'],
        ['Từ chối thỏa thuận', 'happy:2', 'Không ai phải biến mất'],
        ['Bắt mụ giao nộp kho báu', 'gold:8;happy:3;witch:-1', 'Mạo hiểm nhưng giữ được người']
      ]
    },
    {
      id: 'e_priest_1', npcId: 'priest', speaker: 'Tu sĩ trưởng Edda', title: 'Chuông nhà thờ im tiếng', tag: 'Đức tin',
      description: 'Tu viện đề nghị xóa một phần nợ nếu ngài trao quyền xét xử cho giáo hội.',
      quote: '“Đức tin sẽ xoa dịu nỗi đau đói kém của dân chúng.”',
      maxDays: 3,
      ignoredEffect: 'happy:-6;church:-1',
      ignoredMsg: 'Bỏ mặc Tu sĩ: Giáo hội lên án chính quyền vô thần.',
      choices: [
        ['Ký khế ước với giáo hội', 'debt:-28;happy:9;church:1', 'Nợ giảm mạnh · mất quyền tự quyết'],
        ['Xin tu viện cho vay', 'gold:14;debt:12;happy:1', 'Có vàng ngay, nợ phình thêm'],
        ['Từ chối, xin lương thực', 'food:12;happy:-1', 'Giữ quyền cai trị']
      ]
    },
    {
      id: 'e_guard_1', npcId: 'guard', speaker: 'Đội trưởng tuần tra', title: 'Dấu chân bên đèo', tag: 'Biên giới',
      description: 'Trinh sát phát hiện dấu vết toán quân lạ đang tiến gần đường núi phía Bắc.',
      quote: '“Nếu không gia cố phòng thủ, chúng ta sẽ thụ động khi bị tấn công.”',
      maxDays: 2,
      ignoredEffect: 'pop:-4;food:-6',
      ignoredMsg: 'Bỏ mặc Đội trưởng: Toán cướp đường núi tràn vào cướp phá xóm ngoài.',
      choices: [
        ['Gửi quà hỏi tin', 'gold:-7;happy:2;aid:1', 'Có thể mua được một đồng minh'],
        ['Gia cố cổng ngoài', 'gold:-14;happy:1;levy:1', 'Chuẩn bị cho cuộc vây hãm'],
        ['Lờ đi, giữ vàng', 'happy:-3', 'Không mất tài nguyên hôm nay']
      ]
    },
    {
      id: 'e_blacksmith_1', npcId: 'blacksmith', speaker: 'Thợ rèn Hald', title: 'Thanh kiếm trong lò', tag: 'Chuẩn bị',
      description: 'Thợ rèn cần than và kim loại để đúc thêm giáo mác cho dân quân.',
      quote: '“Lời hứa không chặn nổi giáo mác, tôi cần nguyên liệu ngay.”',
      maxDays: 3,
      ignoredEffect: 'happy:-3;levy:-1',
      ignoredMsg: 'Bỏ mặc Thợ rèn: Lò rèn nguội lạnh, quân lính thiếu vũ khí.',
      choices: [
        ['Đúc vũ khí cho dân quân', 'gold:-17;levy:2;happy:2', 'Tăng sức phòng thủ'],
        ['Bán huy hiệu quý tộc', 'gold:10;happy:-2', 'Lời nhỏ nhưng chắc chắn'],
        ['Đóng cửa lò rèn', 'happy:-2', 'Giữ lại chút tiền']
      ]
    }
  ];

  const $ = id => document.getElementById(id);
  const rand = n => { s.seed = (s.seed * 1664525 + 1013904223) >>> 0; return s.seed % n; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function log(t) {
    s.log.unshift({ day: s.day, text: t });
    s.log = s.log.slice(0, 4);
    $('log').innerHTML = s.log.map(x => `<div>Ngày ${x.day}: <b>${x.text}</b></div>`).join('');
  }

  function addDailyPetition() {
    const activeIds = s.petitions.map(p => p.event.id);
    const available = eventsPool.filter(e => !activeIds.includes(e.id));
    
    if (available.length > 0) {
      const picked = available[rand(available.length)];
      s.petitions.push({
        event: picked,
        daysLeft: picked.maxDays
      });
      toast(`📜 Sớ mới từ ${picked.speaker}: "${picked.title}"`);
    }
  }

  function processIgnoredPetitions() {
    const expired = [];
    const remaining = [];

    s.petitions.forEach(p => {
      p.daysLeft--;
      if (p.daysLeft <= 0) {
        expired.push(p);
      } else {
        remaining.push(p);
      }
    });

    s.petitions = remaining;

    expired.forEach(p => {
      apply(p.event.ignoredEffect);
      log(`⚠️ ${p.event.ignoredMsg}`);
      toast(`⚠️ Bỏ lỡ sớ của ${p.event.speaker}: Hậu quả đã xảy ra!`);
    });
  }

  function renderPetitionsUI() {
    const list = $('petitionList');
    if (s.petitions.length === 0) {
      list.innerHTML = '<div style="font-size:11px;color:var(--muted);font-style:italic;padding:4px">Không có sớ nào đang chờ.</div>';
      return;
    }

    list.innerHTML = s.petitions.map(p => {
      const urgent = p.daysLeft <= 1 ? 'timer-urgent' : 'timer-normal';
      return `
        <div class="petition-card" onclick="openPetitionById('${p.event.id}')">
          <div class="petition-info">
            <span class="petition-speaker">${p.event.speaker}</span>
            <span class="petition-topic">${p.event.title}</span>
          </div>
          <span class="petition-timer ${urgent}">⚠️ Còn ${p.daysLeft} ngày</span>
        </div>
      `;
    }).join('');
  }

  window.openPetitionById = function(eventId) {
    const item = s.petitions.find(p => p.event.id === eventId);
    if (item) openNPCModal(item);
  };

  function renderUI() {
    for (const k of ['day', 'pop', 'happy', 'food', 'gold']) $(k).textContent = s[k];$('debt').textContent = Math.max(0, s.debt);
    renderPetitionsUI();
  }

  function playDayTransition(nextDay, onComplete) {
    const overlay = $('dayOverlay');
    const dayNum = $('overlayDayNum');
    const flavor = $('overlayFlavor');

    dayNum.textContent = `NGÀY ${nextDay}`;
    flavor.textContent = dayFlavors[rand(dayFlavors.length)];

    overlay.classList.remove('hidden');
    setTimeout(() => overlay.classList.add('active'), 30);

    setTimeout(() => {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.classList.add('hidden');
        if (onComplete) onComplete();
      }, 600);
    }, 1300);
  }

  function draw() {
    frame++;
    ctx.clearRect(0, 0, W, H);

    if (bgLoaded) {
      ctx.drawImage(bgImg, 0, 0, W, H);
    } else {
      ctx.fillStyle = '#1e1c20'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#2d2a30'; ctx.fillRect(0, 150, W, H - 150);
      ctx.fillStyle = '#80151f';
      ctx.beginPath(); ctx.moveTo(430, 150); ctx.lineTo(530, 150); ctx.lineTo(650, H); ctx.lineTo(310, H); ctx.fill();
    }

    hovered = null;
    for (let i = 0; i < folks.length; i++) {
      const n = folks[i];
      const d = Math.hypot(pointer.x - n.x, pointer.y - (n.y - 25));
      const isOver = d < 43;
      if (isOver) hovered = n;

      const petition = s.petitions.find(p => p.event.npcId === n.id);

      if (isOver) {
        ctx.fillStyle = '#e3bd7244';
        ctx.beginPath(); ctx.ellipse(n.x, n.y - 24, 29, 43, 0, 0, Math.PI * 2); ctx.fill();
      }

      const bob = Math.sin(frame * .045 + i) * 1.5;
      drawPerson(n.x, n.y + bob, n.color, n.shirt, n.hair, n.hood, n.hat, false);

      ctx.font = '600 12px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1a1915d9';
      roundRect(n.x - 42, n.y - 42 + bob, 84, 20, 5, true);
      ctx.fillStyle = isOver ? '#f4d68e' : '#f1dfbf';
      ctx.fillText(n.name, n.x, n.y - 28 + bob);

      if (petition) {
        const isUrgent = petition.daysLeft <= 1;
        ctx.fillStyle = isUrgent ? '#ef4444' : '#f59e0b';
        roundRect(n.x - 45, n.y - 68 + bob, 90, 20, 10, true);
        ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px "Be Vietnam Pro", sans-serif';
        ctx.fillText(`⚠️ Còn ${petition.daysLeft} ngày`, n.x, n.y - 54 + bob);
      }
    }

    const idleY = Math.sin(frame * .045) * 1.2;
    drawPerson(480, 460 + idleY, '#e5c783', '#803f35', '#332a27', false, false, true);

    canvas.style.cursor = hovered ? 'pointer' : 'default';
  }

  function roundRect(x, y, w, h, r, fill) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r); if (fill) ctx.fill();
  }

  function drawPerson(x, y, skin, shirt, hair, hood, hat, isPlayer) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.fillStyle = '#17151266'; ctx.beginPath(); ctx.ellipse(0, 2, 15, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = isPlayer ? '#332f28' : '#39332b'; ctx.fillRect(-8, -14, 7, 17); ctx.fillRect(2, -14, 7, 17);
    ctx.fillStyle = shirt; ctx.fillRect(-12, -33, 24, 24);
    ctx.fillStyle = skin; ctx.fillRect(-9, -51, 18, 18);
    ctx.fillStyle = hood ? shirt : hair;
    if (hood) {
      ctx.beginPath(); ctx.arc(0, -42, 12, Math.PI, 0); ctx.lineTo(12, -39); ctx.lineTo(-12, -39); ctx.fill();
    } else {
      ctx.fillRect(-10, -54, 20, 7);
    }
    if (hat) {
      ctx.fillStyle = isPlayer ? '#9a733e' : '#5c4934';
      ctx.fillRect(-13, -57, 26, 4); ctx.fillRect(-8, -65, 16, 9);
    }
    if (isPlayer) {
      ctx.fillStyle = '#bb443b'; ctx.fillRect(-13, -33, 6, 22);
      ctx.fillStyle = '#e3bd72'; ctx.fillRect(-2, -31, 4, 5);
    }
    ctx.fillStyle = '#29231f'; ctx.fillRect(3, -44, 2, 2);
    ctx.restore();
  }

  function openNPCModal(petitionObj) {
    const e = petitionObj.event;
    const box = $('box');

    box.innerHTML = `
      <div class="speaker">${e.speaker}</div>
      <span class="tag">${e.tag} · CÒN ${petitionObj.daysLeft} NGÀY CHỜ</span>
      <h2>${e.title}</h2>
      <div class="copy">${e.description}</div>
      <div class="quote">${e.quote}</div>
      <div class="choices" id="choicesBox"></div>
    `;

    const cs = $('choicesBox');
    
    e.choices.forEach(([label, effect, desc]) => {
      const b = document.createElement('button');
      b.className = 'choice';
      b.innerHTML = `<span>${label}</span><span class="cost">${desc}</span>`;
      b.onclick = () => choose(petitionObj, effect, label, desc);
      cs.appendChild(b);
    });

    const deferBtn = document.createElement('button');
    deferBtn.className = 'choice defer';
    deferBtn.innerHTML = `<span>Tạm hoãn (Không tiếp hôm nay)</span><span class="cost">Sớ vẫn nằm trong danh sách chờ</span>`;
    deferBtn.onclick = () => {
      $('dialog').classList.add('hidden');
      toast(`Đã hoãn sớ của ${e.speaker}. Còn ${petitionObj.daysLeft} ngày để xử lý.`);
    };
    cs.appendChild(deferBtn);

    $('dialog').classList.remove('hidden');
  }

  function apply(e) {
    const changes = [];
    const statNames = { pop: '👤 Dân số', happy: '😃 Hạnh phúc', food: '♨ Lương thực', gold: '🪙 Vàng', debt: '📜 Khoản nợ' };
    for (const p of e.split(';')) {
      const [k, v] = p.split(':');
      if (k && v && k in s) {
        const val = Number(v);
        s[k] += val;
        if (statNames[k]) {
          changes.push({ name: statNames[k], val: val });
        }
      }
    }
    return changes;
  }

  function choose(petitionObj, effect, label, desc) {
    s.petitions = s.petitions.filter(p => p.event.id !== petitionObj.event.id);

    const changes = apply(effect);
    log(`Tiếp ${petitionObj.event.speaker}: ${label}`);

    const box = $('box');
    let badgesHTML = changes.map(c => {
      const isPos = c.val > 0;
      const cls = isPos ? 'badge-pos' : 'badge-neg';
      const sign = isPos ? '+' : '';
      return `<div class="effect-badge ${cls}">${c.name}: ${sign}${c.val}</div>`;
    }).join('');

    box.innerHTML = `
      <span class="tag">ĐÃ XỬ LÝ SỚ TRIỀU KIẾN</span>
      <h2>${label}</h2>
      <div class="copy">${desc}</div>
      <div class="effect-list">${badgesHTML}</div>
      <button class="choice" id="nextDayBtn" style="margin-top:20px;justify-content:center;background:#856b43;font-weight:bold">
        <span>Tiếp tục (Qua ngày mới) ➔</span>
      </button>
    `;

    renderUI();

    $('nextDayBtn').onclick = () => advanceDay();
  }

  function advanceDay() {
    $('dialog').classList.add('hidden');

    playDayTransition(s.day + 1, () => {
      s.day++;

      const ration = Math.max(4, Math.ceil(s.pop / 18));
      s.food -= ration;

      if (s.food < 0) {
        let shortage = -s.food;
        s.food = 0;
        const lossPop = Math.min(5, Math.ceil(shortage / 3));
        const lossHappy = Math.min(9, 3 + shortage);
        s.pop -= lossPop;
        s.happy -= lossHappy;
        log('⚠️ Kho lương cạn, dân bỏ trốn vì đói.');
        toast('⚠️ Lương thực cạn kiệt!');
      }

      processIgnoredPetitions();
      addDailyPetition();

      s.pop = clamp(s.pop, 0, 100);
      s.happy = clamp(s.happy, 0, 100);
      s.food = clamp(s.food, 0, 100);
      s.gold = clamp(s.gold, 0, 150);
      s.debt = Math.max(-100, s.debt);

      if (s.witch >= 3) { end('burned'); return; }
      if (s.day === 24 && s.debt > 0) { end('debt'); return; }
      if (s.pop <= 0) { end('empty'); return; }
      if (s.day === 36) { invasion(); return; }

      renderUI();
    });
  }

  function invasion() {
    let score = s.levy * 18 + s.pop * .38 + s.happy * .12 + (s.gold >= 20 ? 10 : 0) + (s.aid ? 12 : 0) + (s.church ? 8 : 0);
    end(score >= 67 ? 'defend' : score >= 48 ? 'scarred' : 'fall');
  }

  function end(type) {
    s.ended = true;
    let o = {
      burned: ['Lửa dưới quảng trường', 'Lần hiến tế thứ ba bị phát giác. Dân kéo đến lâu đài trước bình minh. Mụ phù thủy biến mất; ngọn lửa thiêu rụi cả ngai vàng.', 'Bạn có vàng. Nhưng không ai còn gọi bạn là lãnh chúa.'],
      debt: ['Chủ nợ gõ cửa', 'Ngày 24, đoàn xe nhà buôn đến cùng lính đánh thuê. Lương thực, kho bạc và cánh cổng đều bị tịch thu. Vân Mù đổi chủ không cần một mũi tên.', 'Khoản nợ là lời hứa duy nhất mà bạn không giữ được.'],
      empty: ['Một lãnh địa không còn dân', 'Những người cuối cùng rời đi trong đêm. Lâu đài vẫn đứng, nhưng không còn ai để cai trị.', 'Một chiếc vương miện không thể giữ chân người sống.'],
      defend: ['Bình minh trên tường thành', 'Dân quân giữ được cổng đến khi tuyết tan. Quân xâm lược rút lui, còn người dân lần đầu gọi tên bạn mà không sợ hãi.', 'Vân Mù sống sót. Từ tro tàn, một triều đại mới bắt đầu.'],
      scarred: ['Chiến thắng đẫm máu', 'Kẻ thù rút lui, nhưng một phần thành trì đã cháy đen. Người sống sót dựng lại mái nhà và hỏi liệu mùa sau có tốt hơn không.', 'Bạn giữ được lãnh địa. Cái giá sẽ còn được nhắc đến nhiều năm.'],
      fall: ['Cờ lạ trên tháp cao', 'Cổng thành vỡ trước hoàng hôn. Kẻ xâm lược treo cờ của chúng trên tháp phía bắc.', 'Vân Mù thất thủ vào ngày 36.']
    }[type];

    $('dialog').classList.remove('hidden');$('box').innerHTML = `<span class="tag">Kết thúc · Ngày ${s.day}</span><h2>${o[0]}</h2><div class="copy">${o[1]}</div><div class="quote">${o[2]}</div><button class="choice" onclick="location.reload()"><span>Thử lại từ đầu</span><span class="cost">Chọn một con đường khác</span></button>`;
    $('objective').innerHTML = 'Biên niên sử · kết thúc';
    $('hint').textContent = 'Hành trình đã khép lại';
    renderUI();
  }

  function toast(t) {
    let x = $('toast');
    x.textContent = t;
    x.classList.remove('hidden');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => x.classList.add('hidden'), 2400);
  }

  /* KHỞI ĐỘNG VỚI LỜI CHÚC CỦA QUẢN GIA */
  function intro() {
    $('dialog').classList.remove('hidden');
    $('box').classList.add('startbox');$('box').innerHTML = `
      <div class="eyebrow">Điện Triều Kiến · Lãnh địa Vân Mù</div>
      <h2>Vương miện của kẻ chết</h2>
      <p>Ngai vàng đang trống. Mọi ánh mắt trong đại sảnh đều hướng về phía bạn.</p>
      <button id="begin" class="choice" style="margin-top:20px;justify-content:center">
        <span>Tiến vào Điện Triều Kiến ➔</span>
      </button>
    `;

    $('begin').onclick = () => {
      showStewardWelcome();
    };
  }

  function showStewardWelcome() {
    $('box').classList.remove('startbox');$('box').innerHTML = `
      <div class="speaker">Quản gia Barnaby</div>
      <span class="tag">BÁO CÁO ĐẦU TỰ · NGÀY 1</span>
      <h2>Kính chào Lãnh Chúa mới!</h2>
      
      <div class="copy">
        <p>“Thay mặt toàn thể dân chúng Vân Mù, thần xin gửi lời cầu chúc chân thành nhất. Cầu mong chư thần ban cho Ngài sự trí tuệ, lòng dũng cảm và sự minh mẫn để dẫn dắt lãnh địa vượt qua mùa đông tăm tối này.”</p>
        
        <p style="margin-top: 12px; color: #e4bd72; font-weight: 600;"> Tình hình hiện tại của lãnh địa:</p>
        <ul style="padding-left: 20px; margin: 6px 0; line-height: 1.6; color: #d8cdbb;">
          <li><b>Dân số:</b> ${s.pop} người (Cần lương thực mỗi ngày)</li>
          <li><b>Lương thực trong kho:</b> ${s.food} đơn vị</li>
          <li><b>Kho bạc:</b> ${s.gold} vàng</li>
          <li><b>Khoản nợ gánh vác:</b> <span style="color:#f87171">${s.debt} vàng</span> (Hạn chót ngày 24)</li>
        </ul>

        <p style="color: #f59e0b; font-size: 13px; margin-top: 10px;">
          ⚠️ <b>Cảnh báo:</b> Quân địch dự báo sẽ tiến đánh vào <b>ngày 36</b>. Mỗi ngày sẽ có sớ tấu trình từ các NPC, nếu bỏ mặc quá thời hạn sẽ gây hậu quả nghiêm trọng!
        </p>
      </div>

      <div class="quote">“Toàn bộ Vân Mù giờ đây trông cậy cả vào Ngài. Xin hãy bắt đầu buổi triều kiến!”</div>

      <button id="startGameBtn" class="choice" style="margin-top:18px; justify-content:center; background:#856b43; font-weight:bold">
        <span>Bước lên ngai vàng & Tiếp nhận sớ ➔</span>
      </button>
    `;

    $('startGameBtn').onclick = () => {$('dialog').classList.add('hidden');
      active = true;
      addDailyPetition();
      renderUI();
      log('Quản gia: “Cầu mong chư thần phù hộ Lãnh chúa!”');
    };
  }

  canvas.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    pointer.x = (e.clientX - r.left) * W / r.width;
    pointer.y = (e.clientY - r.top) * H / r.height;
  });

  canvas.addEventListener('pointerleave', () => {
    pointer.x = -999;
    pointer.y = -999;
  });

  canvas.addEventListener('click', e => {
    if (!active || !$('dialog').classList.contains('hidden')) return;
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) * W / r.width;
    const y = (e.clientY - r.top) * H / r.height;

    const npc = folks.find(n => Math.hypot(x - n.x, y - (n.y - 25)) < 43);
    if (npc) {
      const petitionObj = s.petitions.find(p => p.event.npcId === npc.id);
      if (petitionObj) {
        openNPCModal(petitionObj);
      } else {
        toast(`${npc.name} hiện tại chưa có sớ trình lên.`);
      }
    }
  });

  $('skipDayBtn').onclick = () => {
    if (!active || !$('dialog').classList.contains('hidden')) return;
    advanceDay();
  };

  $('fullscreen').onclick = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      toast('Trình duyệt chưa cho phép toàn màn hình.');
    }
  };

  document.addEventListener('fullscreenchange', () => {
    $('fullscreen').textContent = document.fullscreenElement ? '⛶ Thoát toàn màn hình' : '⛶ Toàn màn hình';
  });

  $('restart').onclick = () => location.reload();

  function loop() {
    draw();
    requestAnimationFrame(loop);
  }

  renderUI();
  intro();
  loop();
})();
// Data representing the story elements as nodes and links
const storyData = {
    nodes: [
        { id: "main", label: "여우와 신포도", type: "root", color: "#FF6B6B", radius: 60, icon: "📖", desc: "이솝 우화의 재미있는 이야기!" },
        { id: "fox", label: "여우", type: "character", color: "#FF8E53", radius: 50, icon: "🦊", desc: "배가 아주 고픈 여우예요.\n숲속을 거닐고 있었죠." },
        { id: "grapes", label: "포도", type: "object", color: "#9B59B6", radius: 50, icon: "🍇", desc: "높은 나무에 주렁주렁 매달린\n맛있는 보라색 포도랍니다." },
        { id: "hungry", label: "배고픔", type: "state", color: "#FFA726", radius: 40, icon: "🤤", desc: "꼬르륵~ 여우는 배가 너무 고팠어요.\n저 포도를 먹으면 얼마나 맛있을까?" },
        { id: "try", label: "점프!", type: "event", color: "#4FC3F7", radius: 45, icon: "💨", desc: "영차! 포도를 따려고\n힘껏 점프를 했어요.\n하나, 둘, 셋!" },
        { id: "fail", label: "실패", type: "event", color: "#E57373", radius: 40, icon: "💦", desc: "에구머니나!\n포도가 너무 높아서 닿지 않아요.\n아무리 뛰어도 소용이 없네요." },
        { id: "sour", label: "신 포도", type: "thought", color: "#AED581", radius: 45, icon: "😖", desc: "흥! 저 포도는 분명히\n엄청 셔서 맛이 없을 거야!\n안 먹어!" },
        { id: "moral", label: "교훈", type: "moral", color: "#FDD835", radius: 55, icon: "✨", desc: "가질 수 없다고 해서\n그것을 깎아내리거나\n나쁘게 말하면 안 돼요." }
    ],
    links: [
        { source: "main", target: "fox" },
        { source: "main", target: "grapes" },
        { source: "fox", target: "hungry" },
        { source: "fox", target: "try" },
        { source: "grapes", target: "try" },
        { source: "try", target: "fail" },
        { source: "fail", target: "sour" },
        { source: "fail", target: "moral" }
    ]
};

document.addEventListener("DOMContentLoaded", () => {
    // --- Mind Map Logic ---
    if (typeof d3 === 'undefined') {
        alert("D3 라이브러리를 불러오지 못했습니다. 인터넷 연결을 확인해주세요.");
        return;
    }

    const container = document.getElementById('mindmap-container');
    let width = container.clientWidth;
    let height = container.clientHeight;

    const svg = d3.select("#mindmap-container")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%");

    const g = svg.append("g");

    const simulation = d3.forceSimulation(storyData.nodes)
        .force("link", d3.forceLink(storyData.links).id(d => d.id).distance(150))
        .force("charge", d3.forceManyBody().strength(-500))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(d => d.radius + 15).iterations(2));

    const link = g.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(storyData.links)
        .join("line")
        .attr("stroke-width", 3);

    const nodeGroup = g.append("g")
        .selectAll("g")
        .data(storyData.nodes)
        .join("g")
        .attr("class", "node")
        .call(drag(simulation))
        .style("cursor", "pointer");

    const circles = nodeGroup.append("circle")
        .attr("r", d => d.radius)
        .attr("fill", d => d.color)
        .on("click", (event, d) => {
            event.stopPropagation();
            showModal(d, event.currentTarget);
        });

    nodeGroup.append("text")
        .attr("dy", "-0.2em")
        .style("font-size", d => Math.min(d.radius, 30) + "px")
        .text(d => d.icon);

    nodeGroup.append("text")
        .attr("dy", "1.3em")
        .style("font-size", "14px")
        .text(d => d.label);

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        nodeGroup
            .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    window.addEventListener("resize", () => {
        width = container.clientWidth;
        height = container.clientHeight;
        simulation.force("center", d3.forceCenter(width / 2, height / 2));
        simulation.alpha(0.3).restart();
    });

    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }
        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }
        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }
        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    // --- Chatbot Logic ---
    const chatBtn = document.getElementById("chatbot-toggle-btn");
    const chatWindow = document.getElementById("chatbot-window");
    const closeChat = document.querySelector(".close-chat");
    const sendBtn = document.getElementById("send-btn");
    const userInput = document.getElementById("user-input");
    const messages = document.getElementById("chat-messages");

    chatBtn.addEventListener("click", () => {
        chatWindow.classList.toggle("hidden");
        // Remove animation class after first click to stop bouncing
        chatBtn.style.animation = "none";

        if (!chatWindow.classList.contains("hidden")) {
            userInput.focus();
        }
    });

    closeChat.addEventListener("click", () => {
        chatWindow.classList.add("hidden");
    });

    sendBtn.addEventListener("click", handleUserMessage);
    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleUserMessage();
    });

    function handleUserMessage() {
        const text = userInput.value.trim();
        if (text === "") return;

        addMessage(text, "user");
        userInput.value = "";

        // Simulate thinking time with a bit of randomness
        const thinkingTime = Math.random() * 500 + 500;
        setTimeout(() => {
            const botResponse = getBotResponse(text);
            addMessage(botResponse, "bot");
        }, thinkingTime);
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement("div");
        msgDiv.classList.add("message");
        msgDiv.classList.add(sender === "user" ? "user-message" : "bot-message");
        msgDiv.innerHTML = text;
        messages.appendChild(msgDiv);
        messages.scrollTop = messages.scrollHeight;
    }

    function getBotResponse(input) {
        input = input.toLowerCase();

        // 1. Greetings & Identity
        if (input.includes("안녕") || input.includes("반가워")) return "안녕! 나는 이야기 박사님이야. 우리 같이 '여우와 신포도' 이야기를 알아볼까?";
        if (input.includes("이름") || input.includes("누구")) return "나는 '여우와 신포도'에 대해 모든 걸 알고 있는 이야기 박사님이야! 궁금한 걸 물어봐 줘.";
        if (input.includes("고마워") || input.includes("감사")) return "천만에! 또 궁금한 게 있으면 언제든지 물어봐.";

        // 2. Core Lesson & Moral
        if (input.includes("교훈") || input.includes("배운") || input.includes("의미") || input.includes("주제")) {
            return "이 이야기의 교훈은 매우 중요해! <strong>'가질 수 없다고 해서 그것을 나쁘게 말하거나 깎아내려선 안 된다'</strong>는 거야. <br>혹시 '자기합리화'라는 말 들어봤니?";
        }
        if (input.includes("자기합리화") || input.includes("합리화") || input.includes("핑계")) {
            return "어려운 말이지? 쉽게 말하면 <strong>'자신의 잘못이나 실패를 인정하기 싫어서 그럴듯한 핑계를 대는 것'</strong>을 말해. 여우가 포도를 못 따먹고 '저건 맛없을 거야'라고 한 것처럼 말이야.";
        }
        if (input.includes("인지부조화")) {
            return "우와! 정말 똑똑하구나! 맞아, 여우가 배고픔과 실패 사이에서 마음이 불편해지니까 스스로 속인 거야. 그걸 '인지부조화'라고 해.";
        }

        // 3. Character & Plot Details
        if (input.includes("여우")) {
            if (input.includes("배고") || input.includes("이유") || input.includes("먹었")) return "여우는 쫄쫄 굶어서 배가 아주 많이 고팠어. 그래서 포도를 보자마자 달려들었지.";
            if (input.includes("성격") || input.includes("어때")) return "여우는 끈기가 좀 부족했던 것 같아. 그리고 솔직하지 못하고 남 탓을 하는 성격을 가지고 있네.";
            if (input.includes("색") || input.includes("생김새")) return "이 그림 속의 여우는 예쁜 주황색 털을 가지고 있단다.";
            return "여우는 배가 고파서 포도를 따려고 노력했지만 결국 실패했어.";
        }

        if (input.includes("포도")) {
            if (input.includes("색") || input.includes("무슨")) return "탐스러운 <strong>보라색</strong> 포도였어. 정말 달콤해 보였지!";
            if (input.includes("맛") || input.includes("시어") || input.includes("셔")) return "사실 포도는 아주 달콤하고 맛있게 익었을 거야. 여우가 못 먹어서 억지로 시다고 생각한 거지.";
            if (input.includes("어디")) return "포도는 아주 높은 포도나무 덩굴 위에 매달려 있었어.";
            return "포도는 여우가 닿지 못할 만큼 높이 있었단다.";
        }

        if (input.includes("포기") || input.includes("실패") || input.includes("못") || input.includes("안")) {
            return "여우는 키가 닿지 않아서 몇 번 점프하다가 힘들어서 포기했어. 조금 더 노력했거나 도구를 썼으면 좋았을 텐데!";
        }

        // 4. Miscellaneous & Kid-friendly responses
        if (input.includes("재미")) return "그치? 이솝 우화는 짧지만 정말 재미있고 배울 점이 많아!";
        if (input.includes("다른") || input.includes("비슷") || input.includes("동화")) return "'토끼와 거북이'나 '개미와 베짱이' 이야기도 이솝 우화야. 그것들도 아주 재미있단다!";
        if (input.includes("어디") || input.includes("장소") || input.includes("배경")) return "따뜻한 햇살이 비치는 숲속이었어. 포도나무가 높이 자라있는 곳이었지.";
        if (input.includes("다음") || input.includes("뒤") || input.includes("결말")) return "여우는 결국 포도를 못 먹고 투덜대며 숲속 다른 곳으로 가버렸어. 배는 여전히 고팠겠지?";

        // Default Fallback
        return "음, 그건 조금 어려운 질문인걸? '교훈이 뭐야?', '여우는 왜 포기했어?', '포도는 무슨 맛일까?' 처럼 물어봐 줄래?";
    }
});

// Helper functions for modal
function showModal(data, element) {
    const modal = document.getElementById("story-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalBody = document.getElementById("modal-body");

    modalTitle.innerText = data.icon + " " + data.label;
    modalBody.innerText = data.desc.replace(/\\n/g, "\n");
    modal.classList.remove("hidden");

    d3.select(element)
        .transition()
        .duration(150)
        .attr("r", data.radius * 1.3)
        .transition()
        .duration(150)
        .attr("r", data.radius);
}

document.querySelector(".close-btn").onclick = function () {
    document.getElementById("story-modal").classList.add("hidden");
}

window.onclick = function (event) {
    const modal = document.getElementById("story-modal");
    if (event.target == modal) {
        modal.classList.add("hidden");
    }
}

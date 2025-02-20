let musicData = [];
let sortedIndexList = [];
let recordDataList = [];
let parentIndexList = [];

let leftIndex = 0;
let leftInnerIndex = 0;
let rightIndex = 0;
let rightInnerIndex = 0;
let battleNo = 1;
let sortedNo = 0;
let pointer = 0;

let sortedIndexListPrev = [];
let recordDataListPrev = [];
let parentIndexListPrev = [];

let leftIndexPrev = 0;
let leftInnerIndexPrev = 0;
let rightIndexPrev = 0;
let rightInnerIndexPrev = 0;
let battleNoPrev = 1;
let sortedNoPrev = 0;
let pointerPrev = 0;

let totalBattles = 0;

let video = true;
let region = "eu";

fetch('songList.json')
    .then(response => response.json())
    .then(data => {
        musicData = data;
    })
    .catch(error => {
        console.error("Error loading JSON:", error);
    });

function showDuel(id1, id2) {
    const duelContainer = document.getElementById('duel');
    duelContainer.innerHTML = "";

    function createMusicCard(music, isLeft) {
        const card = document.createElement('div');
        card.className = 'music-card';

        let videoElement;

        if (video || music.mp3 === null) {
            if (music.video.includes("youtube.com")) {
                const videoId = new URL(music.video).searchParams.get("v");
                videoElement = `<iframe src="https://www.youtube-nocookie.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
            } else if (music.video.endsWith(".webm") || music.video.endsWith(".mp4")) {
                if (music.video.includes("animemusicquiz")) {
                    videoElement = `<video controls><source src="https://${region}dist.animemusicquiz.com/${music.video.split('/').pop()}" type="video/webm"></video>`;
                } else {
                    videoElement = `<video controls><source src="${music.video}" type="video/webm"></video>`;
                }
            } else {
                videoElement = "<div>Vidéo non disponible</div>";
            }
        } else if (music.mp3 !== null) {
            if (music.video.includes("animemusicquiz")) {
                videoElement = `<audio controls><source src="https://${region}dist.animemusicquiz.com/${music.video.split('/').pop()}" type="audio/mp3"></audio>`;
            } else {
                videoElement = `<audio controls><source src="${music.mp3}" type="audio/mp3"></audio>`;
            }

        } else {
            videoElement = "<div>MP3 not available !</div>";
        }

        card.innerHTML = `
      ${videoElement}
      <div class="anime">${music.anime}</div>
      <div class="song">${music.name}</div>
    `;

        const button = document.createElement('button');
        button.textContent = "PICK";
        button.addEventListener('click', () => {
            if (isLeft) {
                pick('left');
            } else {
                pick('right');
            }
        });

        card.appendChild(button);
        return card;
    }

    if (id1 < musicData.length && id2 < musicData.length) {
        duelContainer.appendChild(createMusicCard(musicData[id1], true));
        duelContainer.appendChild(createMusicCard(musicData[id2], false));
    } else {
        console.error("Index out of range !");
    }

    const percent = Math.floor(sortedNo * 100 / totalBattles);
    progressBar(`Battle no. ${battleNo}`, percent);

}

function pick(sortType) {

    sortedIndexListPrev = sortedIndexList.slice(0);
    recordDataListPrev = recordDataList.slice(0);
    parentIndexListPrev = parentIndexList.slice(0);

    leftIndexPrev = leftIndex;
    leftInnerIndexPrev = leftInnerIndex;
    rightIndexPrev = rightIndex;
    rightInnerIndexPrev = rightInnerIndex;
    battleNoPrev = battleNo;
    sortedNoPrev = sortedNo;
    pointerPrev = pointer;

    if (sortType === 'left') {
        recordData('left');
    } else {
        recordData('right');
    }

    const leftListLen = sortedIndexList[leftIndex].length;
    const rightListLen = sortedIndexList[rightIndex].length;

    if (leftInnerIndex < leftListLen && rightInnerIndex === rightListLen) {
        while (leftInnerIndex < leftListLen) {
            recordData('left');
        }
    } else if (leftInnerIndex === leftListLen && rightInnerIndex < rightListLen) {
        while (rightInnerIndex < rightListLen) {
            recordData('right');
        }
    }

    if (leftInnerIndex === leftListLen && rightInnerIndex === rightListLen) {
        for (let i = 0; i < leftListLen + rightListLen; i++) {
            sortedIndexList[parentIndexList[leftIndex]][i] = recordDataList[i];
        }
        sortedIndexList.pop();
        sortedIndexList.pop();
        leftIndex = leftIndex - 2;
        rightIndex = rightIndex - 2;
        leftInnerIndex = 0;
        rightInnerIndex = 0;

        sortedIndexList.forEach((val, idx) => recordDataList[idx] = 0);
        pointer = 0;
    }

    if (leftIndex < 0) {
        progressBar(`Completed ! (${battleNo} battles)`, 100);
        autoSave();
        result();
    } else {
        battleNo++;
        autoSave();
        showDuel(sortedIndexList[leftIndex][leftInnerIndex], sortedIndexList[rightIndex][rightInnerIndex]);
    }
}

function recordData(sortType) {
    if (sortType === 'left') {
        recordDataList[pointer] = sortedIndexList[leftIndex][leftInnerIndex];
        leftInnerIndex++;
    } else {
        recordDataList[pointer] = sortedIndexList[rightIndex][rightInnerIndex];
        rightInnerIndex++;
    }

    pointer++;
    sortedNo++;
}

function start() {
    document.querySelector('.title').style.visibility = "hidden";
    document.getElementById("start").style.display = "none";
    document.getElementById("load").style.display = "none";

    let button1 = document.createElement("button");
    button1.classList.add("basic-button");
    button1.textContent = "Undo";
    button1.addEventListener("click", undo);

    let container = document.querySelector(".button-container");
    container.appendChild(button1);

    musicDataToSort = musicData.slice(0);
    recordDataList = musicDataToSort.map(() => 0);
    sortedIndexList[0] = musicDataToSort.map((val, idx) => idx);
    parentIndexList[0] = -1;

    let midpoint = 0;   // Indicates where to split the array.
    let marker = 1;   // Indicates where to place our newly split array.

    for (let i = 0; i < sortedIndexList.length; i++) {
        if (sortedIndexList[i].length > 1) {
            let parent = sortedIndexList[i];
            midpoint = Math.ceil(parent.length / 2);

            sortedIndexList[marker] = parent.slice(0, midpoint);              // Split the array in half, and put the left half into the marked index.
            totalBattles += sortedIndexList[marker].length;
            parentIndexList[marker] = i;                                      // Record where it came from.
            marker++;                                                         // Increment the marker to put the right half into.

            sortedIndexList[marker] = parent.slice(midpoint, parent.length);  // Put the right half next to its left half.
            totalBattles += sortedIndexList[marker].length;
            parentIndexList[marker] = i;                                      // Record where it came from.
            marker++;                                                         // Rinse and repeat, until we get arrays of length 1. This is initialization of merge sort.
        }
    }

    leftIndex = sortedIndexList.length - 2;    // Start with the second last value and...
    rightIndex = sortedIndexList.length - 1;    // the last value in the sorted list and work our way down to index 0.

    leftInnerIndex = 0;                        // Inner indexes, because we'll be comparing the left array
    rightInnerIndex = 0;                        // to the right array, in order to merge them into one sorted array.

    showDuel(sortedIndexList[leftIndex][leftInnerIndex], sortedIndexList[rightIndex][rightInnerIndex]);
    document.querySelector('.progress-container').removeAttribute("hidden");
}

function progressBar(indicator, percentage) {
    document.querySelector('.progressbattle').innerHTML = indicator;
    document.querySelector('.progress-bar').style.width = `${percentage}%`;
}

function undo() {

    if (battleNo === 1) {
        return;
    }

    sortedIndexList = sortedIndexListPrev.slice(0);
    recordDataList = recordDataListPrev.slice(0);
    parentIndexList = parentIndexListPrev.slice(0);

    leftIndex = leftIndexPrev;
    leftInnerIndex = leftInnerIndexPrev;
    rightIndex = rightIndexPrev;
    rightInnerIndex = rightInnerIndexPrev;
    battleNo = battleNoPrev;
    sortedNo = sortedNoPrev;
    pointer = pointerPrev;

    autoSave();

    showDuel(sortedIndexList[leftIndex][leftInnerIndex], sortedIndexList[rightIndex][rightInnerIndex]);
}

function result() {

    const elements = document.querySelectorAll('.music-card');
    elements.forEach(element => {
        element.style.display = 'none';
    });

    document.querySelector('.title').style.visibility = "visible";
    document.querySelector('.title').textContent = "Make sure your sheet is sorted by ID before pasting !";

    let buttons = document.querySelectorAll('.basic-button');
    buttons.forEach(btn => btn.style.display = "none");

    let button1 = document.createElement("button");
    button1.classList.add("copy-button");
    button1.textContent = "Copy ranks to clipboard";
    button1.addEventListener("click", copyToClipboard);

    let container = document.querySelector(".button-container");
    container.appendChild(button1);

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['ID', 'Anime', 'Song', 'Rank'];

    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    musicData.forEach(music => {
        const tr = document.createElement('tr');

        const tdId = document.createElement('td');
        tdId.textContent = music.id;
        tr.appendChild(tdId);

        const tdAnimeName = document.createElement('td');
        tdAnimeName.textContent = music.anime;
        tdAnimeName.title = music.anime;
        tr.appendChild(tdAnimeName);

        const tdMusicName = document.createElement('td');
        tdMusicName.textContent = music.name;
        tdMusicName.title = music.name;
        tr.appendChild(tdMusicName);

        const tdRank = document.createElement('td');
        tdRank.textContent = sortedIndexList[0].indexOf(music.id - 1) + 1;
        tr.appendChild(tdRank);

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    const duelContainer = document.querySelector('.duel-container');
    const tableContainer = document.createElement('div');
    tableContainer.className = "table-container";
    tableContainer.appendChild(table);
    duelContainer.appendChild(tableContainer);

}

function showSettings() {
    document.getElementById("settingsModal").style.display = "block";
    document.getElementById("modalOverlay").style.display = "block";
}

function closeSettings() {
    document.getElementById("settingsModal").style.display = "none";
    document.getElementById("modalOverlay").style.display = "none";
}

function selectOption(type, element) {
    let buttons = document.querySelectorAll(`.option-button[data-type='${type}']`);
    buttons.forEach(btn => btn.classList.remove("active"));
    element.classList.add("active");
    let text = element.textContent;

    if (text === 'Video') {
        video = true;
    } else if (text === 'Audio') {
        video = false;
    } else if (text === 'Europe') {
        region = "eu"
    } else if (text === 'NA West') {
        region = "naw";
    } else if (text === 'NA East') {
        region = "nae"
    }

    showDuel(sortedIndexList[leftIndex][leftInnerIndex], sortedIndexList[rightIndex][rightInnerIndex]);

}

function copyToClipboard() {
    const ranksByID = [];
    musicData.forEach(music => {
        ranksByID.push(sortedIndexList[0].indexOf(music.id - 1) + 1);
    });
    const textToCopy = ranksByID.join("\n");
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert("Copied ranks to clipboard !");
    }).catch(err => {
        console.error("Error copying ranks :", err);
    });
}

function autoSave() {

    localStorage.setItem("sortedIndexList", JSON.stringify(sortedIndexList));
    localStorage.setItem("recordDataList", JSON.stringify(recordDataList));
    localStorage.setItem("parentIndexList", JSON.stringify(parentIndexList));

    localStorage.setItem("leftIndex", JSON.stringify(leftIndex));
    localStorage.setItem("leftInnerIndex", JSON.stringify(leftInnerIndex));
    localStorage.setItem("rightIndex", JSON.stringify(rightIndex));
    localStorage.setItem("rightInnerIndex", JSON.stringify(rightInnerIndex));
    localStorage.setItem("battleNo", JSON.stringify(battleNo));
    localStorage.setItem("sortedNo", JSON.stringify(sortedNo));
    localStorage.setItem("pointer", JSON.stringify(pointer));

    localStorage.setItem("sortedIndexListPrev", JSON.stringify(sortedIndexListPrev));
    localStorage.setItem("recordDataListPrev", JSON.stringify(recordDataListPrev));
    localStorage.setItem("parentIndexListPrev", JSON.stringify(parentIndexListPrev));

    localStorage.setItem("leftIndexPrev", JSON.stringify(leftIndexPrev));
    localStorage.setItem("leftInnerIndexPrev", JSON.stringify(leftInnerIndexPrev));
    localStorage.setItem("rightIndexPrev", JSON.stringify(rightIndexPrev));
    localStorage.setItem("rightInnerIndexPrev", JSON.stringify(rightInnerIndexPrev));
    localStorage.setItem("battleNoPrev", JSON.stringify(battleNoPrev));
    localStorage.setItem("sortedNoPrev", JSON.stringify(sortedNoPrev));
    localStorage.setItem("pointerPrev", JSON.stringify(pointerPrev));

    localStorage.setItem("totalBattles", JSON.stringify(totalBattles));
}

function loadProgress() {

    battleNo = JSON.parse(localStorage.getItem("battleNo"));
    leftIndex = JSON.parse(localStorage.getItem("leftIndex"));
    if (battleNo == null || leftIndex == -1) {
        alert("Can't find resources or already finished");
        battleNo = 1;
        return;
    }

    sortedIndexList = JSON.parse(localStorage.getItem("sortedIndexList"));
    recordDataList = JSON.parse(localStorage.getItem("recordDataList"));
    parentIndexList = JSON.parse(localStorage.getItem("parentIndexList"));

    leftInnerIndex = JSON.parse(localStorage.getItem("leftInnerIndex"));
    rightIndex = JSON.parse(localStorage.getItem("rightIndex"));
    rightInnerIndex = JSON.parse(localStorage.getItem("rightInnerIndex"));
    sortedNo = JSON.parse(localStorage.getItem("sortedNo"));
    pointer = JSON.parse(localStorage.getItem("pointer"));

    sortedIndexListPrev = JSON.parse(localStorage.getItem("sortedIndexListPrev"));
    recordDataListPrev = JSON.parse(localStorage.getItem("recordDataListPrev"));
    parentIndexListPrev = JSON.parse(localStorage.getItem("parentIndexListPrev"));

    leftIndexPrev = JSON.parse(localStorage.getItem("leftIndexPrev"));
    leftInnerIndexPrev = JSON.parse(localStorage.getItem("leftInnerIndexPrev"));
    rightIndexPrev = JSON.parse(localStorage.getItem("rightIndexPrev"));
    rightInnerIndexPrev = JSON.parse(localStorage.getItem("rightInnerIndexPrev"));
    battleNoPrev = JSON.parse(localStorage.getItem("battleNoPrev"));
    sortedNoPrev = JSON.parse(localStorage.getItem("sortedNoPrev"));
    pointerPrev = JSON.parse(localStorage.getItem("pointerPrev"));

    totalBattles = JSON.parse(localStorage.getItem("totalBattles"));

    document.querySelector('.title').style.visibility = "hidden";
    document.getElementById("start").style.display = "none";
    document.getElementById("load").style.display = "none";

    let button1 = document.createElement("button");
    button1.classList.add("basic-button");
    button1.textContent = "Undo";
    button1.addEventListener("click", undo);

    let container = document.querySelector(".button-container");
    container.appendChild(button1);

    document.querySelector('.progress-container').removeAttribute("hidden");

    showDuel(sortedIndexList[leftIndex][leftInnerIndex], sortedIndexList[rightIndex][rightInnerIndex]);
}

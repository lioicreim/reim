const fs = require('fs');
const bases = JSON.parse(fs.readFileSync('d:/MyLibrary/MyDocuments/My Games/_Project/reim/data/bases.json', 'utf8'));

// 필터 제너레이터에서 사용하는 키 이름들
const classMapping = {
    "Armours": "Body Armours", // bases.json의 Armours를 필터 제너레이터의 Body Armours로 매핑
};

// 필터 제너레이터에서 사용하는 모든 클래스 키
const targetKeys = [
    "Foci", "One Hand Maces", "Sceptres", "Spears", "Wands", 
    "Body Armours", "Bows", "Crossbows", "Quarterstaves", "Talismans", "Staves", "Two Hand Maces",
    "Helmets", "Gloves", "Boots", "Shields", "Bucklers"
];

const t1Items = {};
const t2Items = {};

// 초기화
targetKeys.forEach(key => {
    t1Items[key] = [];
    t2Items[key] = [];
});

Object.entries(bases).forEach(([name, data]) => {
    // 매핑된 이름이 있으면 그것을 사용, 없으면 원래 클래스 이름 사용
    let key = classMapping[data.class] || data.class;
    
    if (targetKeys.includes(key)) {
        if (data.tier === 1) {
            t1Items[key].push(name);
        } else if (data.tier === 2) {
            t2Items[key].push(name);
        }
    }
});

// JSON 출력 (복사해서 쓰기 좋게)
console.log("const tierBaseTypes = {");
console.log('  "T1": ' + JSON.stringify(t1Items, null, 2) + ',');
console.log('  "T2": ' + JSON.stringify(t2Items, null, 2));
console.log("};");

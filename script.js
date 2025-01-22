// 从localStorage加载保存的食物列表
let foodList = JSON.parse(localStorage.getItem('foodList')) || [];
const wheel = document.querySelector('.wheel');
const foodListElement = document.getElementById('foodList');
const recommendationElement = document.getElementById('recommendation');
const centerFoodElement = document.getElementById('centerFood');

// 转盘配置
const SPIN_DURATION = 3000; // 转动持续时间（毫秒）
const SPIN_ROUNDS = 5; // 基础转动圈数
let isSpinning = false; // 是否正在旋转

// 黄历吉利词语
const luckyWords = [
    "宜进补", "适合尝鲜", "百食不厌", "开胃解馋", "补气养生",
    "益气健脾", "养精蓄锐", "滋补养生", "开运提神", "促进食缘"
];

// 天气相关推荐语
const weatherReasons = {
    cold: ["暖身暖胃", "增添暖意", "温暖身心"],
    hot: ["开胃爽口", "清凉解暑", "消暑解渴"],
    normal: ["养生进补", "调节脾胃", "均衡营养"]
};

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getCurrentHour() {
    return new Date().getHours();
}

function getSeasonBasedOnMonth() {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return "spring";
    if (month >= 6 && month <= 8) return "summer";
    if (month >= 9 && month <= 11) return "autumn";
    return "winter";
}

function generateRecommendation(food) {
    const hour = getCurrentHour();
    const season = getSeasonBasedOnMonth();
    
    let weatherType = "normal";
    if (season === "winter") weatherType = "cold";
    if (season === "summer") weatherType = "hot";

    let timeReason = "";
    if (hour >= 11 && hour <= 13) {
        timeReason = "正是午餐好时候，";
    } else if (hour >= 17 && hour <= 19) {
        timeReason = "晚餐时分，";
    }

    const luckyWord = getRandomElement(luckyWords);
    const weatherReason = getRandomElement(weatherReasons[weatherType]);

    let seasonReason = "";
    switch(season) {
        case "spring":
            seasonReason = "春日暖阳正好，";
            break;
        case "summer":
            seasonReason = "炎炎夏日，";
            break;
        case "autumn":
            seasonReason = "金秋时节，";
            break;
        case "winter":
            seasonReason = "寒冬时节，";
            break;
    }

    return `${seasonReason}${timeReason}${food}${weatherReason}，今日${luckyWord}！`;
}

function createFoodOption(food, index, total) {
    const option = document.createElement('div');
    option.className = 'food-option';
    option.textContent = food;
    
    // 计算每个选项的角度位置（从12点钟方向开始）
    const angle = ((index * 360) / total) - 90; // 减去90度使其从12点钟方向开始
    const radius = 120; // 圆的半径
    
    // 计算选项在圆上的位置
    const radian = (angle * Math.PI) / 180;
    const x = Math.cos(radian) * radius;
    const y = Math.sin(radian) * radius;
    
    // 设置选项位置和旋转
    option.style.transform = `translate(${x}px, ${y}px) rotate(${angle + 90}deg)`;
    
    return option;
}

// 页面加载时显示已保存的食物
document.addEventListener('DOMContentLoaded', () => {
    updateWheel();
    // 隐藏中心食物和推荐理由
    centerFoodElement.style.opacity = '0';
    recommendationElement.classList.remove('show');
});

document.getElementById('addFood').addEventListener('click', () => {
    const foodInput = document.getElementById('foodInput');
    const food = foodInput.value.trim();
    if (food) {
        if (!foodList.includes(food)) {
            foodList.push(food);
            localStorage.setItem('foodList', JSON.stringify(foodList));
            foodInput.value = '';
            updateWheel();
            alert(`已添加: ${food}`);
        } else {
            alert('这个选项已经添加过了！');
        }
    }
});

function updateWheel() {
    foodListElement.innerHTML = '';
    const total = foodList.length;
    
    if (total === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'food-placeholder';
        placeholder.textContent = '请添加食物选项';
        foodListElement.appendChild(placeholder);
        return;
    }

    foodList.forEach((food, index) => {
        const option = createFoodOption(food, index, total);
        foodListElement.appendChild(option);
    });
}

document.getElementById('spin').addEventListener('click', () => {
    if (foodList.length === 0) {
        alert('请添加一些食物选项!');
        return;
    }

    if (isSpinning) {
        return; // 如果正在旋转，忽略点击
    }

    isSpinning = true;
    const spinButton = document.getElementById('spin');
    spinButton.disabled = true;

    // 隐藏推荐内容和中心食物
    recommendationElement.classList.remove('show');
    centerFoodElement.style.opacity = '0';
    centerFoodElement.classList.remove('show');

    // 随机选择一个食物
    const randomIndex = Math.floor(Math.random() * foodList.length);
    const selectedFood = foodList[randomIndex];
    
    // 计算旋转角度（确保选中项在正上方）
    const baseAngle = (randomIndex * 360 / foodList.length);
    const totalRotation = -(SPIN_ROUNDS * 360 + baseAngle); // 使用负值确保正确的旋转方向
    
    // 先移除之前的transition
    wheel.style.transition = 'none';
    wheel.style.transform = 'rotate(0deg)';
    wheel.offsetHeight; // 强制浏览器重排

    // 在下一帧添加新的transition和rotation
    requestAnimationFrame(() => {
        wheel.style.transition = `transform ${SPIN_DURATION}ms cubic-bezier(0.2, 0, 0.2, 1)`;
        wheel.style.transform = `rotate(${totalRotation}deg)`;
    });

    // 等待转盘停止后显示结果
    setTimeout(() => {
        // 显示选中的食物在中心
        centerFoodElement.textContent = selectedFood;
        centerFoodElement.style.opacity = '1';
        centerFoodElement.classList.add('show');

        // 显示推荐理由
        const recommendation = generateRecommendation(selectedFood);
        recommendationElement.textContent = recommendation;
        recommendationElement.classList.add('show');

        spinButton.disabled = false;
        isSpinning = false;
    }, SPIN_DURATION);
});

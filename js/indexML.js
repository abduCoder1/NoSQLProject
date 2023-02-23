CLASSES = {
    0: 'device',
    1: 'electronic',
    2: 'NiKo',
    3: 's1mple',
    4: 'ZywOo',
};

const MODEL_PATH = "ML/tfjs_model/model.json";
const IMAGE_SIZE = 250;
const TOPK_PREDICTIONS = 5;

let my_model;
const demo = async () => {
    status('Loading model...');

    my_model = await tf.loadLayersModel(MODEL_PATH);
    my_model.predict(tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, 3])).dispose();

    status('');

    const catElement = document.getElementById('cat');
    if (catElement.complete && catElement.naturalHeight !== 0) {
        predict(catElement);
        catElement.style.display = '';
    } else {
        catElement.onload = () => {
            predict(catElement);
            catElement.style.display = '';
        }
    }

    document.getElementById('file-container').style.display = '';
};

async function predict(imgElement) {
    status('Predicting...');
    const startTime1 = performance.now();
    let startTime2;
    const logits = tf.tidy(() => {
        const img = tf.browser.fromPixels(imgElement).toFloat();

        const normalized = img.div(255.0);
        const batched = normalized.reshape([1, IMAGE_SIZE, IMAGE_SIZE, 3]);

        startTime2 = performance.now();
        return my_model.predict(batched);
    });

    const classes = await getTopKClasses(logits, TOPK_PREDICTIONS);
    const totalTime1 = performance.now() - startTime1;
    const totalTime2 = performance.now() - startTime2;
    status(`Done in ${Math.floor(totalTime1)} ms ` +
        `(not including preprocessing: ${Math.floor(totalTime2)} ms)`);

    showResults(imgElement, classes);
}

async function getTopKClasses(logits, topK) {
    const values = await logits.data();

    const valuesAndIndices = [];
    for (let i = 0; i < values.length; i++) {
        valuesAndIndices.push({value: values[i], index: i});
    }
    valuesAndIndices.sort((a, b) => {
        return b.value - a.value;
    });
    const topkValues = new Float32Array(topK);
    const topkIndices = new Int32Array(topK);
    for (let i = 0; i < topK; i++) {
        topkValues[i] = valuesAndIndices[i].value;
        topkIndices[i] = valuesAndIndices[i].index;
    }

    const topClassesAndProbs = [];
    for (let i = 0; i < topkIndices.length; i++) {
        topClassesAndProbs.push({
            className: CLASSES[topkIndices[i]],
            probability: topkValues[i]
        })
    }
    return topClassesAndProbs;
}

function showResults(imgElement, classes) {

		const element = document.querySelector('.pred-container');
		element.remove();

    const predictionContainer = document.createElement('div');
    predictionContainer.className = 'pred-container';

    const imgContainer = document.createElement('div');
    imgContainer.appendChild(imgElement);
    predictionContainer.appendChild(imgContainer);

    const probsContainer = document.createElement('div');

		imgContainer.classList.add("img__result");	
		const suptitle = document.createElement('div');
		// suptitle.innerHTML = "IMG";
		imgContainer.appendChild(suptitle);

		probsContainer.classList.add("pred__result");	


		const rowPapah = document.createElement('h1');
			rowPapah.classList.add("rowPapa__title");
			probsContainer.appendChild(rowPapah);


		const rowPapa = document.createElement('div');
		rowPapa.classList.add("rowPapa");
		probsContainer.appendChild(rowPapa);

    for (let i = 0; i < classes.length; i++) {
        const row = document.createElement('div');
        row.className = 'row';

        const classElement = document.createElement('div');
        classElement.className = 'cell';
        classElement.innerText = classes[i].className;
        row.appendChild(classElement);

        const probsElement = document.createElement('div');
        probsElement.className = 'cell';
        probsElement.innerText = classes[i].probability.toFixed(3);
        row.appendChild(probsElement);

        rowPapa.appendChild(row);
    }

		
    predictionContainer.appendChild(probsContainer);

    predictionsElement.insertBefore(
        predictionContainer, predictionsElement.firstChild);
			// Take the first "cell" in html code
			const cellFirst = document.querySelector(".cell");
			rowPapah.innerHTML = cellFirst.innerHTML;
}

const filesElement = document.getElementById('files');
filesElement.addEventListener('change', evt => {
    let files = evt.target.files;

    for (let i = 0, f; f = files[i]; i++) {

        if (!f.type.match('image.*')) {
            continue;
        }
        let reader = new FileReader();
        const idx = i;

        reader.onload = e => {

            let img = document.createElement('img');
            img.src = e.target.result;
            img.width = IMAGE_SIZE;
            img.height = IMAGE_SIZE;
            img.onload = () => predict(img);
        };


        reader.readAsDataURL(f);
    }
});

const demoStatusElement = document.getElementById('status');
const status = msg => demoStatusElement.innerText = msg;
const predictionsElement = document.getElementById('predictions');
demo();
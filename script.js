class Chessboard {
	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.length = 0;
		this.data = new Array(this.height);

		(function() {
			for (let m = 0; m < this.height; m++) {
				this.data[m] = new Array(this.width).fill('-');
			}
		}).call(this);
	};

	putPieceOnBoard(figure) {
		if (figure.cW < 0 || figure.cW >= this.width) {
			throw new Error('Incorrect index cW...');
		}

		if (figure.cH < 0 || figure.cH >= this.height) {
			throw new Error('Incorrect index cH...');
		}

		this.length++;

		figure.serialNumberOfPosition = this.length;

		this.data[figure.cW][figure.cH] = figure;
	};

	removeShapeFromPosition(figure) {
		if (figure.cW < 0 || figure.cW >= this.width) {
			throw new Error('Incorrect index cW...');
		}

		if (figure.cH < 0 || figure.cH >= this.height) {
			throw new Error('Incorrect index cH...');
		}

		this.length--;

		this.data[figure.cW][figure.cH] = '-';
	};

	draw() {
		for (let v = 0; v < this.height; v++) {
			let rowStr = '';

			for (let n = 0; n < this.width; n++) {
				const item = this.data[v][n];

				if (typeof item === 'object') {
					rowStr += ` ${item.serialNumberOfPosition} `;

				} else {
					item += ` ${item} `;
				}
			}

			console.log(rowStr);
		}
	};
};

class Options {
	constructor() {};

	getOptionsForFigure(figure) {
		switch(figure.nameFigure) {
			case 'horse':
				return ([
					{ cW: '-1', cH: '-2', name: 'Сдвиг вверх и влево' },
					{ cW: '+1', cH: '-2', name: 'Сдвиг вверх и вправо'},
					{ cW: '+2', cH: '-1', name: 'Сдвиг вправо и вверх'},
					{ cW: '+2', cH: '+1', name: 'Сдвиг вправо и вниз'},
					{ cW: '+1', cH: '+2', name: 'Сдвиг вниз и вправо'},
					{ cW: '-1', cH: '+2', name: 'Сдвиг вниз и влево'},
					{ cW: '-2', cH: '+1', name: 'Сдвиг влево и вниз'},
					{ cW: '-2', cH: '-1', name: 'Сдвиг влево и вверх'}
				]);
			default:
				throw new Error('Unknown type of figure...');
		}
	};
};

class HorseFigure {
	constructor(cW, cH) {
		this.cW = cW;
		this.cH = cH;
		this.serialNumberOfPosition = -1;
		this.nameFigure = 'horse';
		this.adjMap = {};
	};

	getNextStep(board) {
		const optionForFigure = options.getOptionsForFigure(this);

		for (let m = 0; m < optionForFigure.length; m++) {
			const option = optionForFigure[m];

			const cWValue = eval(this.cW + option.cW);
			const cHValue = eval(this.cH + option.cH);

			const key = `${cWValue}-${cHValue}`;

			if (this.adjMap[key]) {
				continue;
			}

			this.adjMap[key] = key;

			try {
				const nest = board.data[cWValue][cHValue];

				if (nest === '-') {
					return { cW: cWValue, cH: cHValue };
				}

			} catch (err) {
				continue;
			}
		}

		return -1;
	};
};

function findUniquePath(sourceCoordinateW, sourceCoordinateH) {
	const stack = [];

	const horse = new HorseFigure(sourceCoordinateW, sourceCoordinateH);

	stack.push(horse);

	chessBoard.putPieceOnBoard(horse);

	// Как только в стеке будет лежать предельное количество фигур коней работа алгоритма прекратится, т.к. на каждой клетке доски будет стоять фигурка
	while(stack.length !== (chessBoard.height * chessBoard.width)) {
		console.log('Current size stack', stack.length);

		// Возьми из стека последнюю фигурку
		const lastFigure = stack[stack.length - 1];

		// Найди для текущей фигурки позицию, в которую можно проследовать и поставить там новую фигурку коня
		// У каждой фигурки изначально есть 8 возможных точек постановки новой фигурки коня: часть точек может выходить за пределы доски, часть может указывать на позицию, где уже стоит фигура, часть точек может быть "неуспешной", т.к. не даст положительного результата, но есть и один наиболее корректный ход, который ведет к успеху
		const config = lastFigure.getNextStep(chessBoard);

		if (config === -1) {
			// В случае, если фигура не дает нужных результатов, она снимается со стека и удаляется с доски
			const horseDelete = stack.pop();

			chessBoard.removeShapeFromPosition(horseDelete);

		} else {
			// Рабочая точка постановки новой фигуры вместе с ней заносится в стек и ставится на доску
			const newHorse = new HorseFigure(config.cW, config.cH);

			stack.push(newHorse);

			chessBoard.putPieceOnBoard(newHorse);
		}
	}
};

// Для стандартной шахматной доски 8 x 8 поиск пути будет работать слишком долго;
// 5 x 5 в большинстве случаев ищется за минуту, но есть и долгие маршруты, которые движок браузера устает ждать
const chessBoard = new Chessboard(5, 5);
const options = new Options();

findUniquePath(4, 4);

chessBoard.draw();

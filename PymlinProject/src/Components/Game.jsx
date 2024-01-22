import { useMemo, useState, useEffect, useRef } from 'react';
import axios from 'axios'
import './Game.css'
import { useParams } from 'react-router-dom';

const connections = {
    '0-0': ['0-1', '0-7'],
    '0-1': ['0-0', '0-2', '1-1'],
    '0-2': ['0-1', '0-3'],
    '0-3': ['0-2', '0-4', '1-3'],
    '0-4': ['0-3', '0-5'],
    '0-5': ['0-4', '0-6', '1-5'],
    '0-6': ['0-5', '0-7'],
    '0-7': ['0-6', '0-0', '1-7'],

    '1-0': ['1-1', '1-7'],
    '1-1': ['1-2', '1-0', '0-1', '2-1'],
    '1-2': ['1-3', '1-1'],
    '1-3': ['1-4', '1-2', '0-3', '2-3'],
    '1-4': ['1-5', '1-3'],
    '1-5': ['1-6', '1-4', '0-5', '2-5'],
    '1-6': ['1-7', '1-5'],
    '1-7': ['1-0', '1-6', '0-7', '2-7'],

    '2-0': ['2-1', '2-7'],
    '2-1': ['2-2', '2-0', '1-1'],
    '2-2': ['2-3', '2-1'],
    '2-3': ['2-4', '2-2', '1-3'],
    '2-4': ['2-5', '2-3'],
    '2-5': ['2-6', '2-4', '1-5'],
    '2-6': ['2-7', '2-5'],
    '2-7': ['2-0', '2-6', '1-7'],
}

function areConnected(square1, index1, square2, index2) {
    const key1 = `${square1}-${index1}`;
    const key2 = `${square2}-${index2}`;

    return connections[key1]?.includes(key2);
}

function BoardSquare({ padding, onCircleClick }) {
    const startPadding = padding;
    const endPadding = 100 - startPadding;
    const square = padding / 10 - 1;
    return (
        <>
            <line className='board-line' x1={startPadding} y1={startPadding} x2={endPadding} y2={startPadding} />
            <line className='board-line' x1={endPadding} y1={startPadding} x2={endPadding} y2={endPadding} />
            <line className='board-line' x1={endPadding} y1={endPadding} x2={startPadding} y2={endPadding} />
            <line className='board-line' x1={startPadding} y1={endPadding} x2={startPadding} y2={startPadding} />
            <circle className='board-circle' onClick={() => onCircleClick(square, 0)} cx={startPadding} cy={startPadding} r={1} />
            <circle className='board-circle' onClick={() => onCircleClick(square, 1)} cx={50} cy={startPadding} r={1} />
            <circle className='board-circle' onClick={() => onCircleClick(square, 2)}  cx={endPadding} cy={startPadding} r={1} />
            <circle className='board-circle' onClick={() => onCircleClick(square, 3)}  cx={endPadding} cy={50} r={1} />
            <circle className='board-circle' onClick={() => onCircleClick(square, 4)}  cx={endPadding} cy={endPadding} r={1} />
            <circle className='board-circle' onClick={() => onCircleClick(square, 5)}  cx={50} cy={endPadding} r={1} />
            <circle className='board-circle' onClick={() => onCircleClick(square, 6)}  cx={startPadding} cy={endPadding} r={1} />
            <circle className='board-circle' onClick={() => onCircleClick(square, 7)}  cx={startPadding} cy={50} r={1} />
        </>
    )
}

function Stone({ square, index, color, selected, onStoneClick }) {
    let x = 0;
    let y = 0;
    if (index >= 0 && index < 3) {
        y = square * 10 + 10;
        if (index === 0) {
            x = square * 10 + 10;
        } else if (index === 1) {
            x = 50;
        } else if (index === 2) {
            x = 100 - (square * 10 + 10)
        }
    } else if (index >= 4 && index < 7) {
        y = 100 - (square * 10 + 10);
        if (index === 4) {
            x = 100 - (square * 10 + 10)
        } else if (index === 5) {
            x = 50;
        } else if (index === 6) {
            x = square * 10 + 10;
        }
    } else if (index === 3) {
        y = 50;
        x = 100 - (square * 10 + 10)
    } else if (index === 7) {
        y = 50;
        x = square * 10 + 10;
    }
    return (
        <circle cx={x} cy={y} r={3} fill={color} stroke={selected && 'green' || 'transparent'} strokeWidth={0.5} onClick={() => onStoneClick(square, index, color)} />
    )
}

export default function Game() {
    const [stones, setStones] = useState([])

    const [whiteRemaining, setWhiteRemaining] = useState(9)
    const [blackRemaining, setBlackRemaining] = useState(9)

    const whiteStonesCount = stones.filter(s => s.color === 'white').length
    const blackStonesCount = stones.filter(s => s.color === 'black').length

    const [jumpMode, setJumpMode] = useState(false);

    const [turn,setTurn] = useState("Beli igrac");
    const [turn1,setTurn1] = useState("");
    const [turn2,setTurn2] = useState("");

    const [color, setColor] = useState('white')

    const [level,setLevel] = useState("");

    const {mode,lev} = useParams();

    function toggleColor() {
        setColor(c => c === 'white' ? 'black' : 'white')
    }

    const [selectedStone, setSelectedStone] = useState(null);

    const [removeStoneMode, setRemoveStoneMode] = useState(false);

    const [matrixForBackend,setMatrixForBackend] = useState([
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0]
    ])
    const changeMatrix = (s,i,c) => {
        var copyMatrix = [...matrixForBackend];
        copyMatrix[s][i] = c;
        setMatrixForBackend(copyMatrix);
    }

    function checkLine(square, index) {
        if (index % 2 !== 0) {
            // centranli
            const prev = stones.find(s => s.square === square && s.index === index - 1);
            const next = stones.find(s => s.square === square && s.index === index + 1);
            console.log('prev', prev)
            console.log('next', next)
            if (prev && next && prev.color === color && next.color === color) {
                return true;
            }

            let newLine = true;
            for (let i = 0; i < 3; i++) {
                const st = stones.find(s => s.square === i && s.index === index);
                if (!st || st.color !== color) {
                    newLine = false;
                    break;
                }
            }
            if (newLine) {
                return true;
            }
        } else {
            const prevIndex = index - 1 >= 0 ? index - 1 : 7;
            const prevPrevIndex = index - 2 >= 0 ? index - 2 : 6;
            const nextIndex = index + 1;
            const nextNextIndex = (index + 2) % 8;

            const prev = stones.find(s => s.square === square && s.index === prevIndex);
            const prevPrev = stones.find(s => s.square === square && s.index === prevPrevIndex);

            // TODO: check what happens if two lines are created

            if (prev && prevPrev && prev.color === color && prevPrev.color === color) {
                return true;
            }

            const next = stones.find(s => s.square === square && s.index === nextIndex);
            const nextNext = stones.find(s => s.square === square && s.index === nextNextIndex);
            
            if (next && nextNext && next.color === color && nextNext.color === color) {
                return true;
            }
        }

        return false;
    }

    const [clicked, setClicked] = useState(false);
    const [clickedSquare, setClickedSquare] = useState(null)
    const [clickedIndex, setClickedIndex] = useState(null)

    //const [forbiddenMode,setForbiddenMode] = useState(false);

    const [again,setAgain] = useState(6);

    useEffect(() => {
        if (clicked && checkLine(clickedSquare, clickedIndex)) {
            setRemoveStoneMode(true);
            setClicked(false); }
          else if (clicked) {
            toggleColor();
        }
    }, [stones, clicked]);

    function onCircleClick(square, index) {
        //alert(typeof(lev));
        //if(index %2 == 0) return;
        console.log('circle clicked', square, index);
        if (removeStoneMode) return;
        //if(forbiddenMode) return;

        setClickedSquare(square);
        setClickedIndex(index);

        let clicked = false;
        if (color === 'white' && whiteRemaining > 0 || color === 'black' && blackRemaining > 0) {
            // putting new stones
            setStones(s => [...s, { square, index, color }])
            //changeMatrix(square,index,color);
            if (color === 'white') {
                setWhiteRemaining(whiteRemaining - 1);
                //setTurn("Beli igrac");
            } else if (color === 'black') {
                setBlackRemaining(blackRemaining - 1);
                //setTurn("Crni igrac");
            }
            clicked = true;
            //setTurn("Computer");
//            setCompTurn(compTurn*(-1));
        } else {
            // moving stones
            if (selectedStone && (jumpMode || areConnected(selectedStone.square, selectedStone.index, square, index))) {
                setJumpMode(false);
                setStones(stones.map(stone =>
                    stone.square === selectedStone.square && stone.index === selectedStone.index && stone.color === selectedStone.color
                    ? { square, index, color: selectedStone.color }
                    : stone
                    
                ));
                clicked = true;
            }
        }

        setClicked(clicked);

        // if (clicked && checkLine(square, index)) {
        //     setRemoveStoneMode(true);
        //     return;
        // }

        // if (clicked) {
        //     toggleColor()
        // }

        // check for points
    }

    function onStoneClick(square, index, stoneColor) {
        console.log('stone clicked', square, index, stoneColor)
        if (removeStoneMode) {
            if (color === stoneColor) return;

            setStones(stones.filter(s => !(s.square === square && s.index === index)));

            setRemoveStoneMode(false);

            // 4 because of setStones taking effect only after next render
            if (
                whiteRemaining === 0 && blackRemaining === 0 &&
                (color === 'white' && blackStonesCount === 4 ||
                color === 'black' && whiteStonesCount === 4)
            ) {
                setJumpMode(true);
            }

            if (
                color === 'white' && blackStonesCount === 3 ||
                color === 'black' && whiteStonesCount === 3
            ) {
                // Game Over!
            }

            toggleColor();
            return;
        }

        if (color !== stoneColor) return;
        if (stoneColor === 'white' && whiteRemaining > 0 || stoneColor === 'black' && blackRemaining > 0) return;
        if (selectedStone && selectedStone.square === square && selectedStone.index === index && selectedStone.color === stoneColor) {
            setSelectedStone(null);
        } else {
            const newStone = stones.find(s => s.square === square && s.index === index && s.color === stoneColor);
            setSelectedStone(newStone);
        }
    }

    function generateConnectedLines() {
        const lines = [];

        for (let square = 0; square < 3; square++) {
            indexLoop: for (let startIndex = 0; startIndex < 4; startIndex++) {
                const start = startIndex * 2;
                const end = start + 2;
                const colors = [];
                for (let index = start; index <= end; index++) {
                    const stone = stones.find(s => s.square === square && s.index === index % 8);
                    if (!stone) continue indexLoop;
                    colors.push(stone.color);
                }
                if (colors.length !== 3) continue; // mozda ne treba
                let lineColor;
                if (colors.every(c => c === 'white')) {
                    lineColor = 'green';
                } else if (colors.every(c => c === 'black')) {
                    lineColor = 'red';
                } else {
                    continue;
                }

                if (startIndex === 0 || startIndex === 2) {
                    lines.push(<line
                        key={`${square}-${startIndex}`}
                        style={{ stroke: lineColor, strokeWidth: 0.7 }}
                        data-start-index={startIndex}
                        x1={square * 10 + 10}
                        y1={startIndex === 2 ? 90 - square * 10 : 10 + square * 10}
                        x2={90 - square * 10}
                        y2={startIndex === 2 ? 90 - square * 10 : 10 + square * 10}
                    />);
                } else {
                    lines.push(<line
                        key={`${square}-${startIndex}`}
                        style={{ stroke: lineColor, strokeWidth: 0.7 }}
                        data-start-index={startIndex}
                        x1={startIndex === 1 ? 90 - square * 10 : 10 + square * 10}
                        y1={square * 10 + 10}
                        x2={startIndex === 1 ? 90 - square * 10 : 10 + square * 10}
                        y2={90 - square * 10}
                    />);
                }
            }
        }

        outerLoop: for (let index = 1; index < 8; index += 2) {
            const colors = [];
            for (let square = 0; square < 3; square++) {
                const stone = stones.find(s => s.square === square && s.index === index);
                if (!stone) continue outerLoop;
                colors.push(stone.color);
            }

            if (colors.length !== 3) continue;
            let lineColor;
            if (colors.every(c => c === 'white')) {
                lineColor = 'yellow';
            } else if (colors.every(c => c === 'black')) {
                lineColor = 'green';
            } else {
                continue;
            }

            switch (index) {
            case 1:
                lines.push(<line key={`crossed-${index}`} style={{ stroke: lineColor, strokeWidth: 0.7 }} x1={50} y1={10} x2={50} y2={30} />)
                break;
            case 3:
                lines.push(<line key={`crossed-${index}`} style={{ stroke: lineColor, strokeWidth: 0.7 }} x1={70} y1={50} x2={90} y2={50} />)
                break;
            case 5:
                lines.push(<line key={`crossed-${index}`} style={{ stroke: lineColor, strokeWidth: 0.7 }} x1={50} y1={70} x2={50} y2={90} />)
                break;
            case 7:
                lines.push(<line key={`crossed-${index}`} style={{ stroke: lineColor, strokeWidth: 0.7 }} x1={10} y1={50} x2={30} y2={50} />)
                break;
            }
        }

        return lines;
    }

    const connectedLines = useMemo(generateConnectedLines, [stones]);

    const [moveToStone, setMoveToStone] = useState(null);

    var matrica = [[0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0]]
    function playMove(move) {
        console.log("POTEZ:",move);
        switch (move[0]) {
            case 'set': {
                const { color, square, index } = fromBackend(move);
                onCircleClick(square, index);
                matrica[square][index] = move[1];
               // changeMatrix(square,index,color);
                break;
            }
            case 'move': {
                const [to, from] = fromBackend(move);
                //alert(`${again},${color}`);
                //console.log(matrix);
                setAgain(old => old+1);
                
                console.log('from', from)
                console.log('to', to)
                onStoneClick(from.square, from.index, from.color);
                
                /* if(again %5 == 0 ){
                    for (let i = 0; i < 3; i++) {
                        for (let j = 0; j < 8; j++) {
                            if(matrica[i][j] == 0){
                                setMoveToStone({
                                    square: i,
                                    index: j,
                                    color:color
                                });
                            }
                            
                        }
                        
                        
                    }
                } */
              
                  setMoveToStone(to);
                //if(moveToStone == null) setAgain(true);
                
                //changeMatrix(from.square,from.index,0);
                //changeMatrix(to.square,to.index,to.color);
                break;
            }
            case 'remove': {
                const { color, square, index } = fromBackend(move);
                onStoneClick(square, index, color === 'white' ? 'black' : 'white');
                //changeMatrix(square,index, 1 ? color=='white' : -1);
                break;
            }
        }
    }

    useEffect(()=>{
        if(blackStonesCount == 2 && blackRemaining==0) alert("Pobedio je beli igrac!")
        if(whiteStonesCount == 2 && whiteRemaining==0) alert("Pobedio je crni igrac!")
    },[blackStonesCount,whiteStonesCount])

    useEffect(() => {
        console.log('move to stone', moveToStone)
        if (moveToStone) {
            onCircleClick(moveToStone.square, moveToStone.index);
        }
        setMoveToStone(null);
        //setAgain(true);
    }, [moveToStone])

    function indexToBackendIndex(index) {
        return j;
    }

    function toBackendRepr() {
        // all-zero 3x3x3 matrix
       /*  const matrix = Array(3)
            .fill(null)
            .map(_ => Array(3)
                .fill(null)
                .map(_ => Array(3).fill(0))
            );
         */
        const matrix = [
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0]
        ];
        let white_count = 0;
        let black_count = 0;
        for (const stone of stones) {
            const { color, square, index } = stone;
            const player = color === 'white' ? 1 : -1;
            const x = square;
            const y = index;
            //const [y, z] = indexToBackendIndex(index);

            //matrix[x][y][z] = player;

            matrix[x][y] = player;

            if (player === 1) {
                white_count++;
            } else if (player === -1) {
                black_count++;
            }
        }

        const gameData = {
            stones: matrix,
            difficulty: lev,
            line_made: removeStoneMode,
            white_remaining: whiteRemaining,
            black_remaining: blackRemaining,
            white_count,
            black_count,
            player: color === 'white' ? 1 : -1,
            turn: 0,
        }
        setLevel(gameData.difficulty);
       
        return gameData
    }

    function fromBackend(move) {
        const [type, player, x, y, fromX, fromY ] = move;

        if (type === 'set' || type === 'remove') {
            return fromBackendCoordinates(move);
        } else if (type === 'move') {
            const to = fromBackendCoordinates([ type, player, x, y ]);
            const from = fromBackendCoordinates([ type, player, fromX, fromY ]);
            //if(from.square %2 == 0) fromBackend(move);
            return [to, from];
        }
    }

    //koordinate sa backenda prevodimo u state

    function fromBackendCoordinates(move) {
        const [ type, player, x, y ] = move;
        const square = x;
        let index = y;
        /* if (y === 0) {
            index = z;
        } else if (y === 1 && z === 0) {
            index = 7;
        } else if (y === 1 && z === 2) {
            index = 3;
        } else if (y === 2 && z === 0) {
            index = 6;
        } else if (y === 2 && z === 1) {
            index = 5;
        } else if (y === 2 && z === 2) {
            index = 4;
        } */

        return { color: player === 1 ? 'white' : 'black', square, index };
    }
    if(mode != "hh"){

    useEffect(() => {
        async function getAiMove() {
            console.log('sending request B')
            const gameData = toBackendRepr();
            try {
                const response = await axios.post('http://localhost:8000/gamee/movee/', gameData);
                const newMove = response.data;
                console.log(newMove.move)
                console.log("Level",gameData.difficulty);
                playMove(newMove.move);
                setTurn("Human");
            } catch (e) {
                console.error(e)
            }
        }
        if(mode == 'hc'){
        if(color == 'black'){
            
             getAiMove();
            // toggleColor();
        }
    }
    else if(mode == "cc"){ getAiMove();}
    
    }, [color, removeStoneMode])
}
        
    useEffect(()=>{
        if(mode == "hh"){
            setTurn1("Covek 1");
            setTurn2("Covek 2");
        }
        if(mode == "hc"){
            setTurn1("Covek");
            setTurn2("Racunar");
        }
        if(mode == "cc"){
            setTurn1("Racunar");
            setTurn2("Racunar");
        }
    },[])
    useEffect(()=>{
    if (color == "white") setTurn("Beli igrac");
    if(color=="black") setTurn("Crni igrac");
    },[color])

    


    return (
        <div id="game-container">
            <div>
            <h3>Beli igrac: {turn1}</h3>
            
            <h3>Broj kuglica: {whiteRemaining}</h3>
            </div>
            <div>
                <h3>Trenutno na potezu: {turn}</h3>
            <svg viewBox='0 0 100 100'>
                {/* Game B */}
                <line className='board-line' x1={50} y1={10} x2={50} y2={30} />
                <line className='board-line' x1={70} y1={50} x2={90} y2={50} />
                <line className='board-line' x1={50} y1={70} x2={50} y2={90} />
                <line className='board-line' x1={10} y1={50} x2={30} y2={50} />
                <BoardSquare padding={10} onCircleClick={onCircleClick} />
                <BoardSquare padding={20} onCircleClick={onCircleClick} />
                <BoardSquare padding={30} onCircleClick={onCircleClick} />
                {/* {...generateConnectedLines()} */}
                {...connectedLines}

                {stones.map(({ square, index, color }) =>
                    <Stone
                         key={`${square}-${index}-${color}`}
                         square={square}
                         index={index}
                         color={color}
                         selected={selectedStone && selectedStone.square === square && selectedStone.index === index && selectedStone.color === color}
                         onStoneClick={onStoneClick}
                    />
                )}
            </svg>
            <h3>Level: {lev}</h3>
            </div>
            <div>
                <h3>Crni igrac: {turn2}</h3>
                <h3>Broj kuglica: {blackRemaining}</h3>
                {/* <h3>Current player: {turn}</h3>
                <h3>White remaining: {whiteRemaining}</h3>
                <h3>Black remaining: {blackRemaining}</h3>
                <h3>White count: {whiteStonesCount}</h3>
                <h3>Black count: {blackStonesCount}</h3>
                <h3>Jump mode: {JSON.stringify(jumpMode)}</h3> */}
            </div>
        </div>
    )
}
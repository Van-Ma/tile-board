import './TileBoard.scss';
import { useState, useEffect, useRef } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { useDragLayer } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
const ItemTypes = { OBJECT: 'object' };

// square in droppable grid 
const DroppableSquare = ({ row, col, object, onDrop, onStartDrag }) => {
    const [, drop] = useDrop(() => ({
        accept: ItemTypes.OBJECT,
        drop: (item) => {
            onDrop(row, col, item.id);
        },
        collect: monitor => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    return (
        <div ref={drop} className="snap-square" onDragStart={() => onStartDrag(row, col)}>
            {object && (
                <DraggableObject
                    key={object.id}
                    id={object.id}
                    image={object.image}
                    color={object.color}
                    alt={object.alt}
                />
            )}
        </div>
    );
};

// drop area outside of grid area (returns object to selection area)
const DroppableArea = ({ onDrop }) => {
    const [, drop] = useDrop(() => ({
        accept: ItemTypes.OBJECT,
        drop: (item) => onDrop(-1, -1, item.id),
    }));

    return <div ref={drop} className="droppable-area" />;
};

// draggable tiles 
const DraggableObject = ({ id, image, alt, color, onDragEnd, idMatch }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.OBJECT,
        item: { id },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: (item, monitor) => {
            const didDrop = monitor.didDrop();
            if (!didDrop && onDragEnd) {
                onDragEnd(item.id);
            }
        },
    }));

    // selection visual cues 
    const isActive = !!idMatch;
    const filter = isActive ? "brightness(0.5)" : "none";

    return (
        <img
            ref={drag}
            src={image}
            alt={alt}
            className="snap-item"

            style={{
                pointerEvents: "auto",
                backgroundColor: color,
                filter: filter,
                opacity: isDragging ? 0 : 1,
            }}
        />
    );
};

// custom ghost image for dragged object 
const CustomDragLayer = ({ snapObjects }) => {
    const { item, isDragging, currentOffset } = useDragLayer((monitor) => ({
        item: monitor.getItem(),
        isDragging: monitor.isDragging(),
        currentOffset: monitor.getClientOffset(),
    }));

    if (!isDragging || !currentOffset || !item) return null;

    const obj = snapObjects.find((o) => o.id === item.id);
    if (!obj) return null;

    const style = {
        position: "fixed",
        pointerEvents: "none",
        top: currentOffset.y,
        left: currentOffset.x,
        transform: "translate(-50%, -50%)",
        zIndex: 100,
    };

    return (
        <img
            src={obj.image}
            alt={obj.alt}
            style={{ ...style, width: 50, height: 50, opacity: 0.7 }}
        />
    );
};


function TileBoard() {
    // define tile objects
    const initialSnapObjects = [
        { id: 1, image: '/snap/1.png', alt: 'shrimp', color: '#FFD633', position: null },
        { id: 2, image: '/snap/2.png', alt: 'watermelon', color: '#0062D1', position: null },
        { id: 3, image: '/snap/3.png', alt: 'bug', color: '#FF8025', position: null },
        { id: 4, image: '/snap/4.png', alt: 'tomato', color: '#66CC2F', position: null },
        { id: 5, image: '/snap/6.png', alt: 'monstera', color: '#FFD633', position: null },
        { id: 6, image: '/snap/7.png', alt: 'aloe', color: '#FF4433', position: null },
        { id: 7, image: '/snap/9.png', alt: 'butterfly', color: '#FFD633', position: null },
        { id: 8, image: '/snap/11.png', alt: 'carrot', color: '#3E0074', position: null },
        { id: 9, image: '/snap/12.png', alt: 'toad', color: '#FF4433', position: null },
        { id: 10, image: '/snap/13.png', alt: 'strawberry', color: '#FFD633', position: null },
        { id: 11, image: '/snap/14.png', alt: 'watercan', color: '#FF4433', position: null },
        { id: 12, image: '/snap/15.png', alt: 'fish', color: '#0062D1', position: null },
        { id: 13, image: '/snap/16.png', alt: 'flower', color: '#FF4433', position: null },
        { id: 14, image: '/snap/17.png', alt: 'cherry', color: '#FFD633', position: null },
        { id: 15, image: '/snap/18.png', alt: 'sun', color: '#3E0074', position: null },
        { id: 16, image: '/snap/19.png', alt: 'pot', color: '#0062D1', position: null },
        { id: 17, image: '/snap/20.png', alt: 'star', color: '#3E0074', position: null },
        { id: 18, image: '/snap/21.png', alt: 'cat', color: '#FF8025', position: null },
        { id: 19, image: '/snap/22.png', alt: 'cactus', color: '#FFD633', position: null },
        { id: 20, image: '/snap/24.png', alt: 'peapod', color: '#FF4433', position: null },
        { id: 21, image: '/snap/28.png', alt: 'rocketship', color: '#0062D1', position: null },
        { id: 22, image: '/snap/29.png', alt: 'caterpillar', color: '#FFD633', position: null },
        { id: 23, image: '/snap/30.png', alt: 'dog', color: '#3E0074', position: null },
    ];

    const [visibleCount, setVisibleCount] = useState(8);
    const [startIndex, setStartIndex] = useState(0);
    const [smallDevice, setSmallDevice] = useState(window.innerWidth < 900);
    const carouselRef = useRef(null);
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [snapObjects, setSnapObjects] = useState(initialSnapObjects);
    const [objects, setObjects] = useState(initialSnapObjects);

    // build 3x3 grid, display correct tile  
    const renderGrid = () => {
        return (
            <div className="snap-grid">
                {Array.from({ length: 3 }).map((_, row) => (
                    <div className="row" key={row}>
                        {Array.from({ length: 3 }).map((_, col) => {
                            const index = row * 3 + col;
                            const object = snapObjects.find((obj) => obj.position === index);

                            return (
                                <DroppableSquare
                                    key={`${row}-${col}`}
                                    row={row}
                                    col={col}
                                    object={object}
                                    onDrop={handleDrop}
                                    onStartDrag={handleStartDrag}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    };

    // gets grid index the tile is being dragged from, saves index to update later 
    const handleStartDrag = (row, col) => {
        const dropIndex = row * 3 + col;
        setDraggedIndex(dropIndex);
    };

    // handles dragged object, update tile object's position
    const handleDrop = (row, col, id) => {
        const dropIndex = row >= 0 && col >= 0 ? row * 3 + col : null;

        // dropped outside of grid (in droppable area)
        if (row === -1 && col === -1) {
            setSnapObjects((prev) => {

                const draggedObj = prev.find((obj) => obj.id === id);

                if (draggedObj) {

                    draggedObj.position = null;
                }

                return [...prev];
            });

            return;
        }
        // dropped into valid grid square 
        setSnapObjects((prev) => {
            const updated = [...prev];
            const draggedObj = updated.find((obj) => obj.id === id);
            const displacedObj = updated.find((obj) => obj.position === dropIndex);

            if (draggedObj && dropIndex !== null) {
                // if the grid square is already occupied
                if (displacedObj) {
                    const displacedPosition = displacedObj.position;
                    // swap tile positions 
                    displacedObj.position = draggedObj.position;

                    draggedObj.position = dropIndex;
                } else {
                    draggedObj.position = dropIndex;
                }
            }

            return updated;
        });
    };

    // moves carousel left or right 
    const handlePrev = () => {
        if (startIndex > 0) setStartIndex((prev) => prev - 1);
    };

    const handleNext = () => {
        if (startIndex + visibleCount < snapObjects.length)
            setStartIndex((prev) => prev + 1);
    };

    // preloads images, updates screen size 
    useEffect(() => {
        // resize logic
        const update = () => {
            const isSmall = window.innerWidth < 900;
            setSmallDevice(isSmall);
            setVisibleCount(isSmall ? 5 : 8);
        };

        window.addEventListener("resize", update);
        update();

        // preload images
        const preloaded = snapObjects.map(obj => {
            const img = new Image();
            img.src = obj.image;
            return img;
        });

        // cleanup
        return () => {
            window.removeEventListener("resize", update);
        };
    }, [snapObjects]);

    // smooth scroll behavior 
    useEffect(() => {
        if (!smallDevice && carouselRef.current?.children.length > 0) {
            const firstItem = carouselRef.current.children[0];
            const itemWidth = firstItem.getBoundingClientRect().width;
            const gap = 5;
            carouselRef.current.scrollTo({
                left: startIndex * (itemWidth + gap),
                behavior: "smooth",
            });
        }
    }, [startIndex, smallDevice]);


    const visibleItems = snapObjects.slice(startIndex, startIndex + visibleCount);
    // mobile
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;


    return (
        <DndProvider
            backend={isTouchDevice ? TouchBackend : HTML5Backend}
            options={isTouchDevice ? { enableMouseEvents: true, delayTouchStart: 0 } : undefined}
        >
            {/* custom ghost image */}
            <CustomDragLayer snapObjects={snapObjects} />

            <div className="droppable-area">
                {/* droppable area (outside of grid) */}
                <DroppableArea onDrop={handleDrop} />

                {/* carousel */}
                <div className={`carousel-container ${smallDevice ? 'mobile' : ''}`}>
                    {/* carousel scroll left */}
                    <button className="arrow left" onClick={handlePrev} disabled={startIndex === 0}>←</button>

                    {/* tile obejcts */}
                    <div className="carousel-view">
                        <div className="carousel-track" ref={carouselRef}>
                            {(smallDevice ? snapObjects : visibleItems).map((obj) => (
                                <DraggableObject
                                    key={obj.id}
                                    id={obj.id}
                                    image={obj.image}
                                    alt={obj.alt}
                                    color={obj.color}
                                    idMatch={obj.position !== null}
                                />
                            ))}
                        </div>
                    </div>

                    {/* carousel scroll right */}
                    <button className="arrow right" onClick={handleNext} disabled={startIndex + visibleCount >= snapObjects.length}>→</button>
                </div>

                {/* grid area */}
                <div className={`snap-container ${smallDevice ? 'mobile' : ''}`}>
                    <div className={`snap-grid ${smallDevice ? 'mobile' : ''}`}>
                        {renderGrid()}
                    </div>
                </div>
            </div>
        </DndProvider>
    );
}

export default TileBoard;

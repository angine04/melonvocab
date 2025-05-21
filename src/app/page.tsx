'use client'; // Add 'use client' directive

import React, { useState } from 'react'; // Import useState

const HomePage: React.FC = () => {
  // Sample Data
  const flashcards = [
    { word: 'Hello', definition: 'A common greeting.' },
    { word: 'World', definition: 'The Earth and all people and things on it.' },
    { word: 'Next.js', definition: 'A popular React framework.' },
    { word: 'Tailwind CSS', definition: 'A utility-first CSS framework.' },
    { word: 'TypeScript', definition: 'A superset of JavaScript that adds static typing.' }
  ];

  // State Variables
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showDefinition, setShowDefinition] = useState(false);

  // Button Handlers
  const handleShowDefinition = () => {
    setShowDefinition(true);
  };

  const handleNextWord = () => {
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    setShowDefinition(false); // Hide definition for the new word
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="p-4 border rounded shadow">
        {/* Display Logic for Word */}
        <h1 className="text-2xl font-bold mb-2">
          {flashcards[currentCardIndex].word}
        </h1>
        {/* Display Logic for Definition */}
        <div className="mb-4 definition-area">
          {showDefinition ? (
            <p>{flashcards[currentCardIndex].definition}</p>
          ) : (
            <p>Click "Show Definition" to see it.</p> 
          )}
        </div>
        <button
          onClick={handleShowDefinition}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          // Optionally disable if definition is already shown
          // disabled={showDefinition} 
        >
          Show Definition
        </button>
        <button
          onClick={handleNextWord}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Next Word
        </button>
      </div>
    </main>
  );
};

export default HomePage;

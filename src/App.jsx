import { useState } from 'react';
import './App.css';

const API_KEY = import.meta.env.VITE_DOG_API_KEY;

function App() {
  const [currentDog, setCurrentDog] = useState(null);
  const [banList, setBanList] = useState([]);
  const [prevDogs, setPrevDogs] = useState([]);
  const [allBreeds, setAllBreeds] = useState([]);

  const fetchDog = async () => {
    try {
      // Fetch all breeds only once
      if (allBreeds.length === 0) {
        const breedsResponse = await fetch(
          'https://api.thedogapi.com/v1/breeds',
          {
            headers: {
              'x-api-key': API_KEY
            }
          }
        );

        if (!breedsResponse.ok) {
          throw new Error(`HTTP error status: ${breedsResponse.status}`);
        }

        const breeds = await breedsResponse.json();
        setAllBreeds(breeds);
        await selectRandomDog(breeds);
      } else {
        await selectRandomDog(allBreeds);
      }

    } catch (error) {
      console.error("Error fetching dog:", error);
      alert("Error fetching dog.");
    }
  };

  const selectRandomDog = async (breeds) => {
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      // pick random breed
      const randomBreed = breeds[Math.floor(Math.random() * breeds.length)];

      const dog = {
        breed: randomBreed.name,
        lifeSpan: randomBreed.life_span || "Unknown",
        breedGroup: randomBreed.breed_group || "Mixed",
        breedId: randomBreed.id
      };

      // check if attributes in ban list
      const isBanned = banList.includes(dog.breed) ||
        banList.includes(dog.lifeSpan) ||
        banList.includes(dog.breedGroup);

      if (!isBanned) {
        // fetch img for the breed
        try {
          const imageResponse = await fetch(
            `https://api.thedogapi.com/v1/images/search?breed_ids=${dog.breedId}`,
            {
              headers: {
                'x-api-key': API_KEY
              }
            }
          );

          const imageData = await imageResponse.json();

          if (imageData && imageData.length > 0) {
            dog.image = imageData[0].url;
            console.log("Found dog with image:", dog);
            setCurrentDog(dog);
            setPrevDogs(prev => [...prev, dog]);
            return;
          } else {
            console.log("No image found for breed, trying another...");
            attempts++;
            continue;
          }
        } catch (error) {
          console.error("Error fetching image:", error);
          attempts++;
          continue;
        }
      }

      attempts++;
    }

    alert("Couldn't find suitable dog. Try removing some items from the ban list.");
  };

  const addToBanList = (attribute) => {
    if (!banList.includes(attribute) && attribute !== "Unknown" && attribute !== "Mixed") {
      setBanList([...banList, attribute]);
      console.log("Added to ban list:", attribute);
    }
  };

  const removeFromBanList = (attribute) => {
    setBanList(banList.filter(item => item !== attribute));
    console.log("Removed from ban list:", attribute);
  };

  return (
    <div className="whole-page">
      <div className="header">
        <h1>Discover Dogs!</h1>
        <h3>Discover dogs from your wildest dreams!</h3>
        <p>Dislike a dog's breed, life span, or breed group? Just click on it to ban it!</p>
      </div>

      <div className="main-content">
        <div className="ban-list">
          <h2>Ban List</h2>
          <p>Select an attribute in your listing to ban it</p>
          <div className="ban-items">
            {banList.length === 0 ? (
              <p>No attributes banned yet</p>
            ) : (
              banList.map((item, index) => (
                <button
                  key={index}
                  className="ban-button"
                  onClick={() => removeFromBanList(item)}
                >
                  {item}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="dog-display">
          <button className="discover-button" onClick={fetchDog}>
            🔀 Discover!
          </button>

          {currentDog && (
            <div className="dog-card">
              <h2>Veni Vici!</h2>
              <p>Discover dogs with breed information!</p>
              <div className="dog-attributes">
                <button
                  className="attribute-button"
                  onClick={() => addToBanList(currentDog.breed)}
                >
                  {currentDog.breed}
                </button>
                <button
                  className="attribute-button"
                  onClick={() => addToBanList(currentDog.lifeSpan)}
                >
                  {currentDog.lifeSpan}
                </button>
                <button
                  className="attribute-button"
                  onClick={() => addToBanList(currentDog.breedGroup)}
                >
                  {currentDog.breedGroup}
                </button>
              </div>
              <img
                src={currentDog.image}
                alt={currentDog.breed}
                className="dog-image"
              />
            </div>
          )}
        </div>

        <div className="history">
          <h2>History</h2>
          <p>Your recently viewed dogs</p>
          <div className="history-images">
            {prevDogs.length === 0 ? (
              <p>No dogs discovered yet!</p>
            ) : (
              prevDogs.slice(-4).reverse().map((dog, index) => (
                <img
                  key={index}
                  src={dog.image}
                  alt={dog.breed}
                  className="history-image"
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
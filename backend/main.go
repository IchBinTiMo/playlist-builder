package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/joho/godotenv"
	spotify "github.com/zmb3/spotify/v2"
	spotifyauth "github.com/zmb3/spotify/v2/auth"
)

var (
	env_err       = godotenv.Load()
	redirectURI   = "http://localhost:8080/callback"
	authenticator = spotifyauth.New(
		spotifyauth.WithClientID(os.Getenv("CLIENT_ID")),
		spotifyauth.WithClientSecret(os.Getenv("CLIENT_SECRET")),
		spotifyauth.WithRedirectURL(redirectURI),
		spotifyauth.WithScopes(
			"playlist-modify-public",
			"playlist-modify-private",
		))
	ch    = make(chan *spotify.Client)
	state = "spotify_auth_state"
)

// Enable CORS by setting the necessary headers
func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")                            // Allow all origins (use a specific origin for production)
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")          // Allow specific methods
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization") // Allow headers
	w.Header().Set("Access-Control-Allow-Credentials", "true")                    // Allow cookies (optional)

	// Handle preflight request for OPTIONS method
	// if r.Method == http.MethodOptions {
	// 	w.WriteHeader(http.StatusOK)
	// 	return
	// }
}

func handleAuth(w http.ResponseWriter, r *http.Request) {
	fmt.Println("handleAuth called")
	enableCORS(w)

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var payload map[string]interface{}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	payloadJSON, _ := json.Marshal(payload)
	state = base64.StdEncoding.EncodeToString(payloadJSON)
	scopes := "playlist-modify-public playlist-modify-private"

	authUrl := fmt.Sprintf(
		"https://accounts.spotify.com/authorize?client_id=%s&response_type=code&redirect_uri=%s&state=%s&scope=%s",
		os.Getenv("CLIENT_ID"),
		url.QueryEscape(redirectURI),
		url.QueryEscape(state),
		url.QueryEscape(scopes),
	)

	// url := authenticator.AuthURL(encodedPayload)
	// http.Redirect(w, r, url, http.StatusFound)

	response := map[string]string{"authUrl": authUrl}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

}

func completeAuth(w http.ResponseWriter, r *http.Request) {

	fmt.Println("CompleteAuth called")
	enableCORS(w)

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	tok, err := authenticator.Token(r.Context(), state, r)
	if err != nil {
		fmt.Println("102", r.Context(), r.ContentLength)
		http.Error(w, "Couldn't get token", http.StatusForbidden)
		log.Fatal(err)
	}

	st := r.FormValue("state")

	if st != state {
		fmt.Println("109")
		http.NotFound(w, r)
		log.Fatalf("State mismatch: %s != %s\n", st, state)
	}

	var frontendPayload map[string]interface{}

	decodedState, err := base64.StdEncoding.DecodeString(st)

	if err != nil {
		fmt.Println("119", st, state)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := json.Unmarshal(decodedState, &frontendPayload); err != nil {
		fmt.Println("125", frontendPayload, decodedState)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	fmt.Print(frontendPayload)

	client := spotify.New(authenticator.Client(r.Context(), tok))

	// Get the current user
	user, err := client.CurrentUser(context.Background())
	if err != nil {
		log.Fatalf("Failed to get current user: %v", err)
	}
	fmt.Printf("Logged in as: %s\n", user.ID)

	// Create a new playlist
	currentTime := time.Now()
	playlistName := frontendPayload["playlistName"].(string)
	fmt.Println("Playlist Name:", playlistName)
	if playlistName == "" {
		playlistName = "[My Go Playlist] " + currentTime.Format("2006-01-02 15:04:05")
	}

	description := "A playlist created with Go and the Spotify API"
	isPublic := true

	playlist, err := client.CreatePlaylistForUser(context.Background(), user.ID, playlistName, description, isPublic, false)
	if err != nil {
		log.Fatalf("Failed to create playlist: %v", err)
	}
	fmt.Printf("Created playlist: %s\n", playlist.Name)

	keywords, ok := frontendPayload["keywords"].([]interface{})

	if !ok {
		fmt.Println("Failed to get keywords")
		return
	}

	var songNames []string

	for _, keyword := range keywords {
		if str, ok := keyword.(string); ok {
			songNames = append(songNames, str)
		} else {
			log.Println("Non-string value found in keywords")
		}
	}

	// songArtistsSet := []map[string]bool{}

	// for i, artists := range songArtists {
	// 	songArtistsSet = append(songArtistsSet, map[string]bool{})

	// 	for _, artist := range artists {
	// 		songArtistsSet[i][artist] = true
	// 	}
	// }

	fmt.Println("Searching for tracks...")

	trackURIs := []spotify.ID{}

	// for i, songName := range songNames {
	for _, songName := range songNames {
		results, err := client.Search(context.Background(), songName, spotify.SearchTypeTrack)

		if err != nil {
			log.Fatalf("Failed to search for song: %s", songName)
			continue
		} else {
			trackURIs = append(trackURIs, results.Tracks.Tracks[0].ID)
			// for _, item := range results.Tracks.Tracks {
			// 	found := false
			// 	fmt.Printf("Found track: %s by %s, URI: %s\n", item.Name, item.Artists[0].Name, item.ID)

			// 	for _, artist := range item.Artists {
			// 		if songArtistsSet[i][artist.Name] {
			// 			found = true
			// 			trackURIs = append(trackURIs, item.ID)
			// 			break
			// 		}
			// 	}

			// 	if found {
			// 		break
			// 	}
			// }
		}
	}

	_, err = client.AddTracksToPlaylist(context.Background(), playlist.ID, trackURIs...)
	if err != nil {
		log.Fatalf("Failed to add tracks to playlist: %v", err)
	}
	fmt.Println("Tracks added to the playlist!")

	// http.Redirect(w, r, "http://localhost:5173/", http.StatusFound)
	fmt.Fprintln(w, "Login Completed!")
	// response := map[string]string{"status": "Done!"}
	// w.Header().Set("Content-Type", "application/json")
	// json.NewEncoder(w).Encode(response)
	ch <- client
}

func handler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Hello, World!")
}

func main() {
	if env_err != nil {
		log.Fatal("Error loading .env file")
	}

	http.HandleFunc("/callback", completeAuth)
	http.HandleFunc("/api", handleAuth)
	http.HandleFunc("/", handler)

	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}

	fmt.Println("Please log in to Spotify by visiting: http://localhost:8080")
	// client := <-ch

}

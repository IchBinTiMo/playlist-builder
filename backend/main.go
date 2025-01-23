package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	spotify "github.com/zmb3/spotify/v2"
	spotifyauth "github.com/zmb3/spotify/v2/auth"
)

var (
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

func main() {
	http.HandleFunc("/callback", completeAuth)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		url := authenticator.AuthURL(state)
		http.Redirect(w, r, url, http.StatusFound)
	})

	go http.ListenAndServe(":8080", nil)

	fmt.Println("Please log in to Spotify by visiting: http://localhost:8080")
	client := <-ch

	// Get the current user
	user, err := client.CurrentUser(context.Background())
	if err != nil {
		log.Fatalf("Failed to get current user: %v", err)
	}
	fmt.Printf("Logged in as: %s\n", user.ID)

	// Create a new playlist
	currentTime := time.Now()
	playlistName := "[My Go Playlist] " + currentTime.Format("2006-01-02 15:04:05")
	description := "A playlist created with Go and the Spotify API"
	isPublic := true

	playlist, err := client.CreatePlaylistForUser(context.Background(), user.ID, playlistName, description, isPublic, false)
	if err != nil {
		log.Fatalf("Failed to create playlist: %v", err)
	}
	fmt.Printf("Created playlist: %s\n", playlist.Name)

	songNames := []string{"Die with a smile"}

	songArtists := [][]string{{"Lady Gaga", "Bruno Mars"}}
	songArtistsSet := []map[string]bool{}

	for i, artists := range songArtists {
		songArtistsSet = append(songArtistsSet, map[string]bool{})

		for _, artist := range artists {
			songArtistsSet[i][artist] = true
		}
	}

	fmt.Println("Searching for tracks...")

	trackURIs := []spotify.ID{}

	for i, songName := range songNames {
		results, err := client.Search(context.Background(), songName, spotify.SearchTypeTrack)

		if err != nil {
			log.Fatalf("Failed to search for song: %s", songName)
			continue
		} else {
			for _, item := range results.Tracks.Tracks {
				found := false
				fmt.Printf("Found track: %s by %s, URI: %s\n", item.Name, item.Artists[0].Name, item.ID)

				for _, artist := range item.Artists {
					if songArtistsSet[i][artist.Name] {
						found = true
						trackURIs = append(trackURIs, item.ID)
						break
					}
				}

				if found {
					break
				}
			}
		}
	}

	_, err = client.AddTracksToPlaylist(context.Background(), playlist.ID, trackURIs...)
	if err != nil {
		log.Fatalf("Failed to add tracks to playlist: %v", err)
	}
	fmt.Println("Tracks added to the playlist!")
}

func completeAuth(w http.ResponseWriter, r *http.Request) {
	tok, err := authenticator.Token(r.Context(), state, r)
	if err != nil {
		http.Error(w, "Couldn't get token", http.StatusForbidden)
		log.Fatal(err)
	}
	if st := r.FormValue("state"); st != state {
		http.NotFound(w, r)
		log.Fatalf("State mismatch: %s != %s\n", st, state)
	}

	client := spotify.New(authenticator.Client(r.Context(), tok))
	fmt.Fprintln(w, "Login Completed!")
	ch <- client
}

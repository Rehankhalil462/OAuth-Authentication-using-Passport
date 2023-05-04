#Whole Process

The user clicks on the "Login with Google" button, which sends a GET request to the /auth/google route in the app.

The app handles this request by calling the passport.authenticate function with the "google" strategy and specifying the scope of the data requested from Google, which in this case is limited to the user's email address.

Passport then redirects the user to the Google authentication page to ask for permission to access their email.

If the user grants permission, Google sends an authorization code to the app's /auth/google/callback route. Passport handles this callback by calling the passport.authenticate function again with the "google" strategy and passing in the authorization code.

Passport uses the Google API to exchange the authorization code for an access token and a refresh token. It then invokes the verifyCallback function specified in the Google strategy to fetch the user's profile information and determine whether the user is authenticated.

If the verifyCallback function returns a profile, Passport serializes the profile information into a user ID and stores it in the user's session. Passport also sets two cookies with a short expiration time: one to store the user's session ID and the other to store a key that ensures the cookie is signed and encrypted.

On subsequent requests, Passport deserializes the user ID from the session and fetches the user's profile information from the server. It checks the user's session ID and cookie key to verify the session and authenticate the user.

To protect certain routes that require authentication, the app uses the checkLoggedIn middleware function. This function checks whether the user is authenticated by calling the req.isAuthenticated() function provided by Passport. If the user is authenticated, the function calls the next middleware function in the chain. If not, it sends an HTTP 401 error response.

When the user logs out, the app clears the user's session and redirects them to the homepage.

So, in summary, OAuth and cookie-based authentication in this code allow the user to log in with their Google account and access protected routes within the app while maintaining a secure, encrypted session.

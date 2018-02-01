INSERT INTO backyard.application
    SET grant_type = 1,
        client_id = 'fbaaaef1100071a85fea',
        client_secret = '482e234b180129b5a4553af5441eb51b0616950c',
        client_name = 'Web Client Test',
        repo_url = 'https://github.com/neefrankie/oauth-web-client',
        description = 'A Web Client Demo',
        callback_url = 'http://localhost:3000/callback',
        owner_id = 75;
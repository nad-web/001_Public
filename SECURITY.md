# Security

This is a public source repository. Never commit API credentials, tokens, private keys, personal records, or sensitive production data. Ignored files are not an access-control mechanism; already tracked files remain public until appropriately removed from history and any exposed credentials rotated.

The static browser app cannot keep a secret key. Features requiring secrets need separately hosted server code and runtime configuration outside this public source.

When implementing apps, validate imported records and numbers, use safe DOM APIs for user text, handle storage failures, bound expensive processing, and review dependency and dataset licenses. Keep the Pages artifact limited to intended runtime files.

To report a vulnerability, use the repository’s **Security → Report a vulnerability** option if private vulnerability reporting is enabled. If it is not available, open a minimal issue requesting a private reporting channel without including exploit details, credentials, or personal data. The owner can enable private vulnerability reporting in repository security settings after creation.

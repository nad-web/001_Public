# Shared foundations

`styles/tokens.css` provides the portfolio’s colors, typography, and theme variables. Apps can reuse it with a relative URL or keep their own styles.

Promote code here only when at least two apps need the same stable behavior. Keep business logic inside its app. Namespaces for browser storage should include the app id, for example `001-public:deutsch-daily:v1:progress`.

The root library uses `001-public:theme` for its optional theme preference. Its storage calls tolerate unavailable localStorage.

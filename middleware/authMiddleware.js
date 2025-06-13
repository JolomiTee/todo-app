const jwt = require("jsonwebtoken");

const ensureAuthenticated = (req, res, next) => {
	const token = req.cookies.token;
	if (!token) {
		return res.redirect("/login");
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET || "DEFAULT_JWT_SECRET_REPLACE_THIS");
		req.user = decoded;
		next();
	} catch (err) {
		res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
		return res.redirect("/login");
	}
};

module.exports = { ensureAuthenticated };

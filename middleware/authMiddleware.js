const ensureAuthenticated = (req, res, next) => {
	if (req.session.userId) return next();
	res.redirect("/login");
}
	(module.exports = { ensureAuthenticated });

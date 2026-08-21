module.exports = (req, res) => {
  res.status(500).json({ error: "Build failed, placeholder executed instead of compiled code." });
};

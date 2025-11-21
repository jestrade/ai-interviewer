export const init = (req, res) => {
  req.session.interviewHistory = [];
  req.session.role = req.body?.role;

  res.json({
    text: "Interview initialized",
  });
};

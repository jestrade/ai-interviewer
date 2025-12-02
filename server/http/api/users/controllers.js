import { createUser, getUser } from "../../../services/userService.js";
import { CODES } from "../../../constants.js";

export const createUserController = async (req, res) => {
  try {
    const { id, role } = req.body;
    const user = await createUser(id, { role, name: "User", avatar: null });
    res.json({
      text: "User created.",
      code: CODES.CREATE_USER,
      user,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user", code: CODES.ERROR });
  }
};

export const getUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUser(id);
    res.json({
      text: "User found.",
      code: CODES.CREATE_USER,
      user,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user", code: CODES.ERROR });
  }
};

import { createUser, getUser } from "../../../services/userService.js";

export const createUserController = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await createUser({ name, email });
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user", success: false });
  }
};

export const getUserController = async (req, res) => {
  try {
    const { field, value } = req.params;
    const user = await getUser({ field, value });

    res.json({
      user,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user", success: false });
  }
};

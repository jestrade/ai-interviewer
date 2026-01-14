import { jest } from "@jest/globals";
import { createAuditRecord } from "../../services/audit-service.js";
import { writeData } from "../../services/firebase/data-access.js";

// Mock dependencies
jest.mock("../../services/firebase/data-access.js");

describe("Audit Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createAuditRecord", () => {
    it("should create audit record successfully", async () => {
      const auditData = {
        action: "init",
        collection: "interviews",
        user: { email: "test@example.com", role: "Junior" },
      };

      writeData.mockResolvedValue();

      const result = await createAuditRecord(auditData);

      expect(writeData).toHaveBeenCalledWith("audits", auditData);
      expect(result).toEqual(auditData);
    });

    it("should handle writeData errors", async () => {
      const auditData = {
        action: "init",
        collection: "interviews",
        user: { email: "test@example.com", role: "Junior" },
      };

      const error = new Error("Firebase write failed");
      writeData.mockRejectedValue(error);

      await expect(createAuditRecord(auditData)).rejects.toThrow(
        "Firebase write failed"
      );
      expect(writeData).toHaveBeenCalledWith("audits", auditData);
    });

    it("should work with different audit actions", async () => {
      const testCases = [
        { action: "init", collection: "interviews" },
        { action: "end", collection: "interviews" },
        { action: "update", collection: "users" },
        { action: "delete", collection: "sessions" },
      ];

      writeData.mockResolvedValue();

      for (const testCase of testCases) {
        const auditData = {
          ...testCase,
          user: { email: "test@example.com", role: "Junior" },
          timestamp: new Date().toISOString(),
        };

        await createAuditRecord(auditData);

        expect(writeData).toHaveBeenCalledWith("audits", auditData);
      }
    });

    it("should handle audit data with additional properties", async () => {
      const auditData = {
        action: "init",
        collection: "interviews",
        user: { email: "test@example.com", role: "Junior" },
        sessionId: "test_session_123",
        ip: "127.0.0.1",
        userAgent: "Mozilla/5.0...",
        timestamp: new Date().toISOString(),
        metadata: {
          source: "web",
          version: "1.0.0",
        },
      };

      writeData.mockResolvedValue();

      const result = await createAuditRecord(auditData);

      expect(writeData).toHaveBeenCalledWith("audits", auditData);
      expect(result).toEqual(auditData);
    });

    it("should handle empty audit data", async () => {
      const auditData = {};

      writeData.mockResolvedValue();

      const result = await createAuditRecord(auditData);

      expect(writeData).toHaveBeenCalledWith("audits", auditData);
      expect(result).toEqual(auditData);
    });

    it("should handle null audit data", async () => {
      const auditData = null;

      writeData.mockResolvedValue();

      const result = await createAuditRecord(auditData);

      expect(writeData).toHaveBeenCalledWith("audits", auditData);
      expect(result).toBeNull();
    });

    it("should handle audit data with nested objects", async () => {
      const auditData = {
        action: "init",
        collection: "interviews",
        user: {
          email: "test@example.com",
          role: "Junior",
          profile: {
            name: "Test User",
            avatar: "avatar.jpg",
            preferences: {
              theme: "dark",
              language: "en",
            },
          },
        },
        metadata: {
          request: {
            id: "req_123",
            method: "POST",
            path: "/api/init",
          },
        },
      };

      writeData.mockResolvedValue();

      const result = await createAuditRecord(auditData);

      expect(writeData).toHaveBeenCalledWith("audits", auditData);
      expect(result).toEqual(auditData);
    });
  });
});

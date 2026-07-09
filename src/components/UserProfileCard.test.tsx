// src/components/UserProfileCard.test.tsx
import React from "react";
// @ts-ignore
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserProfileCard } from "./UserProfileCard";
import "@testing-library/jest-dom";

// IMPORTANT SETUP: Because our component uses Redux (useDispatch),
const mockDispatch = jest.fn(); // Creates a fake Jest tracking function
jest.mock("react-redux", () => ({
    useDispatch: () => mockDispatch,
}));

describe("UserProfileCard Component Testing", () => {
  // Test 1: Testing the visuals (Topic 2)
    test("renders the username, role, and online status correctly", () => {
        render(
        <UserProfileCard
            username="mansoorghauri"
            role="Admin System"
            isOnline={true}
            messagesSent={10}
        />
    );

    // 2. QUERY & ASSERT: Check if the text is physically on the screen
    expect(screen.getByText("mansoorghauri")).toBeInTheDocument();
    expect(screen.getByText("Admin System")).toBeInTheDocument();
    expect(screen.getByText("Online")).toBeInTheDocument();
    });

  // Test 2: Testing User Interactions (Topic 3)
    test("dispatches a Redux log when the card is clicked", async () => {
        const user = userEvent.setup();

    render(
        <UserProfileCard
        username="sarahodd"
        role="User"
        isOnline={false}
        messagesSent={2}
        />
    );

    const cardElement = screen.getByText("sarahodd");

    // 4. INTERACT: Tell the robotic finger to click it!
    await user.click(cardElement);

    expect(mockDispatch).toHaveBeenCalled();
    });
});

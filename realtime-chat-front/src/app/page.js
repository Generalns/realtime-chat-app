"use client";

import { useEffect, useState, useRef } from "react";
import { redirect } from "next/navigation";
import { FaRegCircleUser } from "react-icons/fa6";
import api from "./api";
import Cookies from "js-cookie";
import Modal from "react-modal";
import InputMask from "react-input-mask";
import io from "socket.io-client";
import { BsCheckAll } from "react-icons/bs";

const Chat = () => {
  const socketUrl = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL
    ? process.env.NEXT_PUBLIC_BACKEND_SERVER_URL
    : "http://localhost:8080";
  const doneTypingInterval = 1000;

  const [logOut, setLogOut] = useState(false);
  const [data, setData] = useState(null);
  const [selectedChat, setSelectedChat] = useState();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [chatPhoneNumber, setChatPhoneNumber] = useState("");
  const [chatMessages, setChatMessages] = useState();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [profile, setProfile] = useState();
  const [typingTimeoutId, setTypingTimeoutId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");

  const socketRef = useRef();

  useEffect(() => {
    const isLoggedIn = Cookies.get("token");
    if (!isLoggedIn) {
      setIsLoggedIn(false);
    }
    setProfile({
      username: Cookies.get("username"),
      phoneNumber: Cookies.get("phoneNumber"),
      userId: Cookies.get("userId"),
    });
    socketRef.current = io(socketUrl);
    socketRef.current.on("receivedMessage", (data) => {
      if (data.chat === selectedChat?.id) {
        socketRef.current.emit("readMsg", {
          receiverId: data.receiverId,
          chatId: selectedChat.id,
        });
      }
      fetchChatData(data.receiverId);
    });
    socketRef.current.on("read", (receiverId) => {
      fetchChatData(receiverId);
    });
    socketRef.current.on("typing", (data) => {
      if (!isTyping) {
        setIsTyping(data.chat);
      }
    });

    socketRef.current.on("stop typing", (data) => {
      setIsTyping();
    });

    socketRef.current.on("newChat", () => {
      fetchChatData(profile?.userId);
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (profile) {
      socketRef.current.emit("userConnect", profile.userId);
      fetchChatData(profile.userId);
    }
  }, [profile]);

  useEffect(() => {
    if (!isLoggedIn) {
      redirect("/login");
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (logOut) {
      Cookies.remove("token");
    }
  }, [logOut]);

  useEffect(() => {
    if (selectedChat) {
      socketRef.current.emit("readMsg", {
        receiverId: profile?.userId,
        chatId: selectedChat?.id,
      });
      fetchChatData(profile?.userId);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (selectedChat) {
      fetchChatMessages(
        selectedChat.senderId,
        selectedChat.receiverId,
        selectedChat.id
      );
    }
  }, [data]);

  const fetchChatMessages = async (senderId, receiverId, chatId) => {
    if (profile?.userId) {
      socketRef.current.emit("readMsg", {
        receiverId: profile.userId,
        chatId: chatId,
      });

      const res = await api.get(
        `/chat/messages/${profile.userId}/${
          receiverId == profile.userId ? senderId : receiverId
        }`
      );
      setChatMessages(res.data.messages);
    }
  };

  const fetchChatData = async (userId) => {
    const res = await api.get(`/chat/${userId}`);
    setData(res.data.chats);
  };

  const handleInput = (e) => {
    setMessage(e.target.value);

    if (!typingTimeoutId) {
      socketRef.current.emit("typing", {
        user:
          selectedChat.receiverId == profile.userId
            ? selectedChat.senderId
            : selectedChat.receiverId,
        chat: selectedChat.id,
      });
    } else {
      clearTimeout(typingTimeoutId);
    }

    setTypingTimeoutId(setTimeout(doneTyping, doneTypingInterval));
  };

  const doneTyping = () => {
    socketRef.current.emit("stop typing", {
      user:
        selectedChat.receiverId == profile.userId
          ? selectedChat.senderId
          : selectedChat.receiverId,
      chat: selectedChat.id,
    });
    setTypingTimeoutId(null);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    console.log(searchTerm);
  };

  const handleNewChat = async (e) => {
    e.preventDefault();
    if (!message || message == "") {
      return;
    }
    const receiverId =
      selectedChat.receiverId == profile.userId
        ? selectedChat.senderId
        : selectedChat.receiverId;
    await api.post(`/chat/private/${receiverId}`, {
      senderId: profile.userId,
      message: message,
    });

    socketRef.current.emit("sendMessage", {
      senderId: parseInt(profile.userId),
      receiverId: receiverId,
      chat: selectedChat.id,
      message,
    });

    fetchChatMessages(
      selectedChat.senderId,
      selectedChat.receiverId,
      selectedChat.id
    );
    fetchChatData(profile.userId);
    setMessage("");
  };

  const startNewChat = async (e) => {
    e.preventDefault();
    const res = await api.get(`/auth/${chatPhoneNumber}`);
    await api.post(`/chat/private/chat/${res.data.userId}`, {
      senderId: profile.userId,
    });

    socketRef.current.emit("newChat", res.data.userId);
    fetchChatData(profile.userId);
    setModalIsOpen(false);
  };

  const Chats = () => {
    return data?.map((chat) => {
      return (
        <div
          onClick={() => {
            setSelectedChat(chat);
            socketRef.current.emit("receiverRead", {
              senderId:
                chat.senderId == profile.userId
                  ? chat.receiverId
                  : chat.senderId,
              chatId: chat.id,
            });
          }}
          key={chat.id}
          className="w-full border-b border-gray-700 py-4 px-4 flex items-center justify-between ">
          <div className="w-full">
            <div className="flex justify-between w-full">
              <div className="flex">
                <p className="mr-2">
                  {chat.receiverUsername == profile.username
                    ? chat.senderUsername
                    : chat.receiverUsername}
                </p>
                <p>
                  ( +90{" "}
                  {chat.receiverUsername == profile.username
                    ? chat.senderPhoneNumber
                    : chat.receiverPhoneNumber}{" "}
                  )
                </p>
              </div>
              {profile.userId == chat.receiverId ? (
                chat.unreadMessagesForReceiver ? (
                  chat.id != selectedChat?.id ? (
                    <div className="p-2 bg-green-600 w-7 flex items-center justify-center rounded-full h-7">
                      {chat.unreadMessagesForReceiver}
                    </div>
                  ) : (
                    <></>
                  )
                ) : (
                  ""
                )
              ) : chat.unreadMessagesForSender ? (
                chat.id != selectedChat?.id ? (
                  <div className="p-2 bg-green-600 w-7 flex items-center justify-center rounded-full h-7">
                    {chat.unreadMessagesForSender}
                  </div>
                ) : (
                  <></>
                )
              ) : (
                ""
              )}
            </div>

            <p className="text-gray-400">
              <p>
                {isTyping == chat.id
                  ? "typing..."
                  : chat.lastMessageContent
                  ? chat.lastMessageContent
                  : ""}
              </p>
            </p>
          </div>
        </div>
      );
    });
  };
  const Messages = () => {
    const messagesEndRef = useRef(null);
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView();
    }, [chatMessages]);

    return (
      <div>
        {chatMessages?.map((message, index) => {
          return (
            <div key={message.id}>
              <div
                key={message.id}
                className={`text-white flex flex-row my-3 ${
                  message.senderId == profile.userId
                    ? "justify-end"
                    : "justify-start"
                }`}>
                <div
                  className={` rounded-xl px-4 py-2 ${
                    message.senderId == profile.userId
                      ? "rounded-tr-none bg-green-700"
                      : "rounded-tl-none bg-gray-600"
                  }`}>
                  <p>{message.content}</p>
                  <p>
                    {message.senderId == profile.userId ? (
                      message.isRead ? (
                        <BsCheckAll className="text-blue-700" />
                      ) : (
                        <BsCheckAll />
                      )
                    ) : message.isRead ? (
                      ""
                    ) : (
                      "Unread"
                    )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} /> {/* This will be scrolled into view */}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <div className="flex flex-grow overflow-hidden">
        <div className="flex flex-col w-1/3 border-r border-gray-700">
          <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center">
              <FaRegCircleUser className="mr-2 text-4xl" />
              <div>
                <p className="text-start text-xl">{profile?.username}</p>
                <p className="text-sm">+90 {profile?.phoneNumber}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setLogOut(true);
                window.location.reload(false);
              }}
              className="text-xl text-center text-white border border-red-500 px-3 py-1 bg-red-500">
              Logout
            </button>{" "}
          </div>
          <form onSubmit={handleSearch} className="flex p-4">
            <input
              type="text"
              placeholder="Search..."
              className="flex-grow px-2 py-1 text-sm rounded-md border-2 border-gray-700 bg-gray-800 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              onClick={() => setModalIsOpen(true)}
              className="px-4 ml-2 py-2 text-sm text-white bg-green-700">
              New Chat
            </button>

            <Modal
              isOpen={modalIsOpen}
              className={"flex flex-col items-center justify-center h-full"}
              onRequestClose={() => setModalIsOpen(false)}>
              <form
                onSubmit={startNewChat}
                className="p-10 bg-black bg-opacity-30 rounded shadow-xl w-96 backdrop-blur-md">
                <h1 className="text-2xl font-bold my-6 text-white">
                  Create chat with someone
                </h1>
                <div className="mb-5">
                  <label
                    htmlFor="phone"
                    className="block mb-2 text-sm text-white">
                    Phone
                  </label>
                  <InputMask
                    mask="999 999 9999"
                    value={chatPhoneNumber}
                    onChange={(e) => setChatPhoneNumber(e.target.value)}>
                    {(inputProps) => (
                      <input
                        {...inputProps}
                        type="text"
                        name="phone"
                        id="phone"
                        placeholder="543 543 5443"
                        className="text-black w-full px-3 py-2 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring-0"
                        required
                      />
                    )}
                  </InputMask>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 text-center bg-blue-600 text-white rounded hover:bg-blue-500 focus:outline-none">
                  Create Chat
                </button>
              </form>
            </Modal>
          </form>

          <div className="flex flex-col p-4 overflow-y-scroll">
            <Chats />
          </div>
        </div>
        {selectedChat ? (
          <div className="flex-grow w-2/3 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
              <p className="text-5xl text-center text-white font-chocolate">
                Chattie
              </p>{" "}
              <div>
                <p className="text-xl">
                  {selectedChat
                    ? selectedChat.senderUsername == profile.username
                      ? selectedChat.receiverUsername
                      : selectedChat.senderUsername
                    : ""}
                </p>
                <p className="text-end">
                  {isTyping == selectedChat.id ? "typing..." : ""}
                </p>
              </div>
            </div>

            <div className="flex-grow flex-col p-4 overflow-y-scroll bg-gray-800 scrollbar-hide">
              <Messages />
            </div>
            <form onSubmit={handleNewChat} className="flex p-4">
              {/* Input for typing messages and sending them */}
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={handleInput}
                className="flex-grow px-2 py-1 text-sm rounded-md border-2 border-gray-700 bg-gray-800 text-white"
              />
              <button
                type="submit"
                className="ml-2 px-4 py-2 text-sm text-white bg-blue-500 rounded-md">
                Send
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-grow w-2/3 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
              <p className="text-5xl text-center text-white font-chocolate">
                Chattie
              </p>{" "}
            </div>

            <div className="flex flex-col p-4  bg-gray-800   text-2xl min-h-screen items-center justify-center">
              <p className="text-4xl font-chocolate">Welcome to the chattie</p>
              <p className="text-center mt-8">
                On the left panel, you'll find a list of your existing chats.
                You also have the options to initiate a new chat or log out of
                your account. To start a new conversation, you need to know the
                other party's phone number. The chat screen on the right is
                where you'll see your messages. You can compose and send new
                messages here. To begin chatting, either initiate a new chat or
                select an existing conversation from the list on the left.
              </p>
              <p className="text-center font-bold mt-8 underline">
                Warning: Please note, it's crucial that the user you want to
                chat with is already registered on the application using the
                phone number you have for them.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;

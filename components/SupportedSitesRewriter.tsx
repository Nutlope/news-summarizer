import { useState, useEffect } from "react";

export const supportedDomains: string[] = ["techcrunch.com", "hackernoon.com"];
export const formattedSupportedDomains: string[] = ["TechCrunch", "HackerNoon"]

const SupportedSitesRewriter = () => {
  const [currentSupportedDomainIndex, setCurrentSupportedDomainIndex] =
    useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let typingInterval: NodeJS.Timer;
    let currentDomain = formattedSupportedDomains[currentSupportedDomainIndex];

    typingInterval = setInterval(() => {
      setCurrentText(
        (prevCurrentText) =>
          prevCurrentText + currentDomain.charAt(currentIndex)
      );
      setCurrentIndex((prevCurrentIndex) => prevCurrentIndex + 1);
      if (currentIndex >= currentDomain.length) {
        setIsDeleting((prevIsDeleting) => !prevIsDeleting);
        clearInterval(typingInterval);
      }
    }, 150);

    return () => {
      clearInterval(typingInterval);
    };
  }, [currentIndex, currentSupportedDomainIndex, isDeleting]);

  useEffect(() => {
    let deletingInterval: NodeJS.Timer;

    deletingInterval = setInterval(() => {
      if (!isDeleting) {
        return;
      }

      setCurrentText((currentText) => currentText.slice(0, -1));
      setCurrentIndex((prevCurrentIndex) => prevCurrentIndex - 1);
      if (currentIndex < 0) {
        clearInterval(deletingInterval);
        setTimeout(() => {
          setCurrentSupportedDomainIndex((prevCurrentSupportedDomainIndex) =>
            prevCurrentSupportedDomainIndex + 1 === formattedSupportedDomains.length
              ? 0
              : prevCurrentSupportedDomainIndex + 1
          );
        }, 100);
        setIsDeleting((prevIsDeleting) => !prevIsDeleting);
      }
    }, 50);

    return () => {
      clearInterval(deletingInterval);
    };
  }, [currentIndex, currentSupportedDomainIndex, isDeleting]);

  return (
    <div>
      {currentText}
      {<span className="animate-blink-1500">|</span>}
    </div>
  );
};

export default SupportedSitesRewriter;

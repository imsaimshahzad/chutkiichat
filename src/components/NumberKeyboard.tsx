import { Delete } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NumberKeyboardProps {
  onNumberPress: (num: string) => void;
  onDelete: () => void;
  onClear: () => void;
}

const NumberKeyboard = ({ onNumberPress, onDelete, onClear }: NumberKeyboardProps) => {
  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"];

  const handlePress = (key: string) => {
    if (key === "C") {
      onClear();
    } else if (key === "⌫") {
      onDelete();
    } else {
      onNumberPress(key);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2 mt-4">
      {numbers.map((key) => (
        <Button
          key={key}
          variant={key === "C" ? "destructive" : key === "⌫" ? "secondary" : "outline"}
          size="lg"
          className="h-14 text-xl font-bold"
          onClick={() => handlePress(key)}
        >
          {key === "⌫" ? <Delete className="w-5 h-5" /> : key}
        </Button>
      ))}
    </div>
  );
};

export default NumberKeyboard;

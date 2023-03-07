import { useForm } from "react-hook-form";
import api from "~/api";
import { formatPrice } from "~/utils/price";
import { useCartStore } from "~/zustand/store";
import CartList from "./CartList";

type FormData = {
  name: string;
  phone: string;
  shipment: string;
  location?: string;
};

export default function Cart() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>();

  const showCart = useCartStore((state) => state.showCart);
  const items = useCartStore((state) => state.items);

  const total = items.reduce((acc, curr) => {
    return acc + curr.price * curr.quantity;
  }, 0);

  const shipment: string = watch("shipment");

  const onSubmit = handleSubmit(async (data) => {
    const cart = items
      .map(
        (item) =>
          "x " +
          item.quantity +
          " " +
          item.name +
          "\n" +
          "subtotal = " +
          formatPrice(item.quantity * item.price)
      )
      .join("\n");

    const messageOrder = {
      ...data,
      cart,
      total,
    };

    const link = await api.whatsapp.sendOrderMessage(messageOrder);
    window.location.href = link;
  });

  return (
    <aside
      className={`fixed z-10 h-screen w-full overflow-y-auto bg-white px-8 pt-20 transition-all delay-75 duration-500 ease-in-out ${
        showCart ? "bottom-0" : "bottom-full"
      }`}
    >
      <h1 className="pb-2 font-dosis text-xl font-bold">Carrito</h1>
      <CartList items={items} />
      <section className="grid justify-items-center py-6">
        <p className="font-dosis text-xl font-semibold">Total:</p>
        <p className="font-dosis text-xl font-semibold">{formatPrice(total)}</p>
      </section>
      <section className="pb-6">
        <form className="grid gap-4 font-dosis" onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="Tu Nombre"
            className="bg-neutral-300 p-2  text-neutral-700"
            {...register("name")}
          />
          <input
            type="text"
            placeholder="Número de Teléfono"
            className="bg-neutral-300 p-2  text-neutral-700"
            {...register("phone")}
          />
          <div className="grid gap-1 font-medium">
            <div className="flex items-center gap-2">
              <label className="basis-1/2">Retiro en sucursal</label>
              <input type="radio" value="pickup" {...register("shipment")} />
            </div>
            <div className="flex items-center gap-2">
              <label className="basis-1/2">Envío a domicilio</label>
              <input type="radio" value="delivery" {...register("shipment")} />
            </div>
          </div>

          {shipment === "delivery" && (
            <select
              className="bg-neutral-300 p-2 font-medium"
              {...register("location")}
            >
              <option>Rivadavia $100</option>
              <option>Capital $200</option>
            </select>
          )}

          <button
            type="submit"
            className="bg-neutral-900 p-2 font-dosis font-semibold text-white"
          >
            Pedir por WS
          </button>
        </form>
      </section>
    </aside>
  );
}

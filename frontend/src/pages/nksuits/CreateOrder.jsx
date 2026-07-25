import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { Input, Select, Textarea } from "../../components/Input";
import Button from "../../components/Button";
import * as nksuitsApi from "../../api/nksuitsApi";

const EMPTY_FORM = {
  Name: "",
  Address: "",
  Contact: "",
  Remarks: "",
  Platform: "Instagram",
  "Platform other": "",
  Type: "ready-made",
  "Actual price": "",
  "sale price": "",
};

export default function CreateOrder() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [options, setOptions] = useState({ platforms: [], types: [] });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    nksuitsApi.getOptions().then(setOptions).catch(() => {});
  }, []);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await nksuitsApi.createOrder({
        ...form,
        "Actual price": parseFloat(form["Actual price"]),
        "sale price": parseFloat(form["sale price"]),
      });
      navigate("/nksuits/orders");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout brand="nksuits" brandLabel="NK Suits Botique">
      <div className="content-frame section form-page">
        <span className="eyebrow">New Entry</span>
        <h1 className="page-title" style={{ fontSize: "48px", marginTop: "8px", marginBottom: "48px" }}>
          Create <em>order</em>
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid-12">
            <div style={{ gridColumn: "1 / span 6" }}>
              <Input
                id="name"
                label="Name"
                value={form.Name}
                onChange={(e) => handleChange("Name", e.target.value)}
                required
              />
            </div>
            <div style={{ gridColumn: "7 / span 6" }}>
              <Input
                id="contact"
                label="Contact"
                value={form.Contact}
                onChange={(e) => handleChange("Contact", e.target.value)}
                required
              />
            </div>

            <div style={{ gridColumn: "1 / span 12" }}>
              <Textarea
                id="address"
                label="Address"
                value={form.Address}
                onChange={(e) => handleChange("Address", e.target.value)}
                required
              />
            </div>

            <div style={{ gridColumn: "1 / span 4" }}>
              <Select
                id="platform"
                label="Platform"
                value={form.Platform}
                onChange={(e) => handleChange("Platform", e.target.value)}
              >
                {(options.platforms.length ? options.platforms : [
                  "Instagram", "Facebook", "Whatsapp", "Word of mouth", "Other",
                ]).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Select>
            </div>

            {form.Platform === "Other" && (
              <div style={{ gridColumn: "5 / span 4" }}>
                <Input
                  id="platform-other"
                  label="Platform (Other)"
                  value={form["Platform other"]}
                  onChange={(e) => handleChange("Platform other", e.target.value)}
                  required
                />
              </div>
            )}

            <div style={{ gridColumn: form.Platform === "Other" ? "9 / span 4" : "5 / span 4" }}>
              <Select
                id="type"
                label="Type"
                value={form.Type}
                onChange={(e) => handleChange("Type", e.target.value)}
              >
                {(options.types.length ? options.types : ["ready-made", "customization"]).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </div>

            <div style={{ gridColumn: "1 / span 6" }}>
              <Input
                id="actual-price"
                label="Actual price"
                type="number"
                step="0.01"
                min="0"
                value={form["Actual price"]}
                onChange={(e) => handleChange("Actual price", e.target.value)}
                required
              />
            </div>
            <div style={{ gridColumn: "7 / span 6" }}>
              <Input
                id="sale-price"
                label="Sale price"
                type="number"
                step="0.01"
                min="0"
                value={form["sale price"]}
                onChange={(e) => handleChange("sale price", e.target.value)}
                required
              />
            </div>

            <div style={{ gridColumn: "1 / span 12" }}>
              <Textarea
                id="remarks"
                label="Remarks"
                value={form.Remarks}
                onChange={(e) => handleChange("Remarks", e.target.value)}
              />
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save Order"}
          </Button>
        </form>
      </div>
    </Layout>
  );
}

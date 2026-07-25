import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { Input, Select, Textarea } from "../../components/Input";
import Button from "../../components/Button";
import * as suitstyleApi from "../../api/suitstyleApi";

const EMPTY_FORM = {
  Name: "",
  Address: "",
  Contact: "",
  Remarks: "",
  Platform: "Instagram",
  "Platform other": "",
};

export default function AddCustomer() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [platforms, setPlatforms] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    suitstyleApi
      .getOptions()
      .then((opts) => setPlatforms(opts.platforms))
      .catch(() => {});
  }, []);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await suitstyleApi.createCustomer(form);
      navigate("/suitstyle/customers");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout brand="suitstyle" brandLabel="Suit Style Store">
      <div className="content-frame section form-page">
        <span className="eyebrow">New Entry</span>
        <h1 className="page-title" style={{ fontSize: "48px", marginTop: "8px", marginBottom: "48px" }}>
          Add <em>customer</em>
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
                {(platforms.length
                  ? platforms
                  : ["Instagram", "Facebook", "Whatsapp", "Word of mouth", "Other"]
                ).map((p) => (
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
            {submitting ? "Saving…" : "Save Customer"}
          </Button>
        </form>
      </div>
    </Layout>
  );
}
